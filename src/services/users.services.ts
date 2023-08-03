import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import database from './database.services'
import { ChangePasswordReqBody, RegisterRequestBody, UpdateProfileReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/hashPassword'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/contants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import USERS_MESSAGE from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/contants/httpStatus'
import Follower from '~/models/schemas/Follow.schema'
import axios from 'axios'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESSTOKEN_EXPIRES_IN
      }
    })
  }

  private signRefeshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESHTOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefeshToken(user_id)])
  }

  async register(payload: RegisterRequestBody) {
    // tao san 1 id de gui email xac nhan, khi xac nhan moi tien hanh tao tai khoan
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const result = await database.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        // date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token,
        username: `user${user_id.toString()}`
      })
    )
    // const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())

    console.log('email_verify_token: ', email_verify_token)

    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return {
      access_token,
      refresh_token,
      result
    }
  }

  async checkEmailExist(email: string) {
    const userEmail = await database.users.findOne({ email })
    return Boolean(userEmail)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    await database.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await database.refreshToken.deleteOne({ token: refresh_token })
    return {
      message: 'Logout success!!!'
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken(user_id),
      database.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            email_verify_token: '',
            updated_at: new Date(),
            verify: UserVerifyStatus.Verified
          }
        }
      )
    ])

    const [access_token, refresh_token] = token
    await database.refreshToken.insertOne(new RefreshToken({
      user_id: new ObjectId(user_id),
      token: refresh_token
    }))

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    console.log('Resend Verify Email: ', email_verify_token)

    // cap nhat lai gia tri email_verify_token trong document user
    await database.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: email_verify_token,
          updated_at: new Date()
        }
      }
    )

    return {
      message: 'Resend email verify success!!!'
    }
  }

  async forgotPasswordToken(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    await database.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // Gui email kem duong link den nguoi dung
    return {
      message: 'Send email to reset password success',
      forgot_password_token
    }
  }

  async resetPassword(user_id: string, password: string) {
    await database.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return {
      message: USERS_MESSAGE.RESET_PASSWORD_SUCCESS
    }
  }

  async getProfile(user_id: string) {
    const user = await database.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0
        }
      }
    )
    return {
      mesage: 'Success!!',
      user
    }
  }

  async updateUser(user_id: string, payload: UpdateProfileReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const result = await database.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateProfileReqBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0
        }
      }
    )
    return {
      message: 'Update profile success!!!',
      data: result.value
    }
  }

  async changePassword(user_id: string, new_password: string) {
    await database.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: 'Change password success!!!'
    }
  }

  async getUserProfile(username: string) {
    const user = await database.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0
        }
      }
    )

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return {
      message: USERS_MESSAGE.GET_USER_PROFILE_SUCCESS,
      data: user
    }
  }

  async follow(user_id: string, followed_user_id: string) {
    const follower = await database.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if(followed_user_id === user_id) {
      throw new ErrorWithStatus({
        message: ('You cannot follow yourself'),
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!follower) {
      await database.followers.insertOne(
        new Follower({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: USERS_MESSAGE.FOLLOW_SUCCESS
      }
    }

    return{
      message: USERS_MESSAGE.USER_FOLLOWED
    }

  }

  async unfollow(user_id: string, _id: string){
    const follower = await database.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(_id)
    })

    // chua follow
    if(follower === null){
      return{
        message: USERS_MESSAGE.ALREADY_UNFOLLOWED
      }
    }

    // da follow, xoa document
    await database.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(_id)
    })

    return{
      message: USERS_MESSAGE.UNFOLLOW_SUCCESS
    }

  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type:'authorization_code'
    }
    const {data} = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data as {
      access_token: string,
      id_token: string
    }

  }

  private async getUserGoogleInfor(access_token: string, id_token: string) {
    const {data} = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo',{
      params:{
        access_token,
        alt:"json",
      },
      headers:{
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string,
      email: string,
      verified_email: boolean,
      name: string,
      given_name: string,
      family_name: string,
      picture: string,
      locale:string
    }
  }

  async oauth(code: string){
    const {access_token, id_token} = await this.getOauthGoogleToken(code)
    const userInfor = await this.getUserGoogleInfor(access_token, id_token)
    // const {email, name} = userInfor
    if(!userInfor.verified_email){
      throw new ErrorWithStatus({
        message:USERS_MESSAGE.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // Kiem tra email ton tai trong database hay chua
    const user = await database.users.findOne({ email: userInfor.email})

    // Ton tai email => cho login vao
    if(user){
      
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user._id.toString())
      await database.refreshToken.insertOne(new RefreshToken({
        user_id: user._id,
        token: refresh_token
      }))

      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify,
        email: user.email, 
        name: user.name
      }

    }else{
       // random string password
       const password = Math.random().toString(36).substring(2, 15)
      // Ko ton tai email => tao tk moi
      const data = await this.register({
        name: userInfor.name,
        email: userInfor.email,
        // date_of_birth: new Date().toISOString(),
        password: password,
        confirm_password: password
      })
      return {...data, newUser: 1, verify: UserVerifyStatus.Unverified, email: userInfor.email, name: userInfor.name}
    }
    

  }

}

const usersService = new UsersService()

export default usersService
