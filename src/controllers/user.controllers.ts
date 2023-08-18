import 'dotenv/config'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { pick } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/contants/enum'
import { ChangePasswordReqBody, LogoutReqBody, RefreshTokenReqBody, RegisterRequestBody, ResetPasswordReqBody, TokenPayload, UpdateProfileReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import database from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  // user_id la object nen p chuyen ve string
  const result = await usersService.login(user_id.toString())
  return res.status(200).send({
    message: 'Login Success!!!',
    data: result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const newUser = await usersService.register(req.body)
  return res.status(201).send({
    message: 'Register Success!!!',
    data: newUser
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json(result)
}

export const emailVerifyController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_email_verify_token as TokenPayload
  const user = await database.users.findOne({
    _id: new ObjectId(user_id)
  }) 

    // ko tim thay user
  if(!user){
    return res.status(404).json({
      message: 'User not found'
    })
  }

  // da verify roi => tra ve status ok voi mess da verify trc do
  if(user.email_verify_token === ''){
    return res.json({
      message: "Email already verified before"
    })
  }

  const result = await usersService.verifyEmail(user_id)

  return res.json({
    message: 'Email verify success',
    result
  })

}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const user = await database.users.findOne({_id: new ObjectId(user_id)})

  if(!user){
    return res.status(404).json({
      message: 'User not found'
    })
  }

  if(user.verify === UserVerifyStatus.Verified){
    return res.status(200).json({message:'Email already verified before!!'})
  }

  const result = await usersService.resendVerifyEmail(user_id, user.email)

  return res.json({
    result
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const {_id, email} = req.user as User
  const result = await usersService.forgotPasswordToken((_id as ObjectId).toString(), email)
  return res.status(200).send(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_forgot_password_token as TokenPayload
  const user = await database.users.findOne({
    _id: new ObjectId(user_id)
  })
  if(!user){
    return res.status(404).send({
      message: 'User not found!!'
    })
  }

  if(user.forgot_password_token === ''){
    return res.status(404).send({
      message: 'Forgot password token already verified before!!'
    })
  }

  // if(user.forgot_password_token !== req.body){
  //   return res.status(404).send({
  //     message: 'Forgot password token invalid!!'
  //   })
  // }

  // const result = await usersService.verifyForgotPassword(user_id)
  return res.status(200).send({
    message: "Verify Success!!!"
  })
}

export const resetPasswordController = async (req:  Request<ParamsDictionary, any, ResetPasswordReqBody>, res: Response) => {
  const {user_id} = req.decoded_forgot_password_token as TokenPayload
  const {password} = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}

export const getProfileController = async(req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await usersService.getProfile(user_id)
  return res.json(result)
}

export const getAllUsersController = async (req: Request, res: Response) => {
  const result = await database.users.find({},{
    projection:{
      password: 0,
      email_verify_token: 0,
      forgot_password_token: 0,
      verify: 0
    }
  }).limit(4).toArray()
  // console.log(result)
  return res.status(200).send({
    message:'Success!!!',
    result: result.length,
    data : result
  })
}

export const updateProfileUserController = async (req: Request<ParamsDictionary, any, UpdateProfileReqBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const body = pick(req.body, ['name', 'bio', 'date_of_birth', 'location', 'website', 'username','avatar', 'cover_photo'])
  const result = await usersService.updateUser(user_id, body) 
  return res.json(result)
}

export const changePasswordController = async (req: Request<ParamsDictionary, any, ChangePasswordReqBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const {new_password} = req.body
  const result = await usersService.changePassword(user_id, new_password) 
  return res.json(result)
}

export const getUserController = async (req: Request, res: Response) => {
  const {username} = req.params
  const result = await usersService.getUserProfile(username)
  return res.json(result)
}

export const followController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const {followed_user_id} = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unfollowController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const {user_id: _id} = req.params
  const result = await usersService.unfollow(user_id, _id)
  return res.json(result)
}

export const oauthController = async (req: Request, res: Response) => {
  const {code} = req.query
  const result = await usersService.oauth(code as string)
  const urlRedirect =`${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}&email=${result.email}&name=${result.name}`
  return res.redirect(urlRedirect)
}

export const getFollowersController = async (req: Request, res: Response) => {
  // const {user_id} = req.params
  const {result, total} = await usersService.getFollowers({
    user_id: req.params.user_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  return res.json({
    total_page: Math.ceil(total / Number(req.query.limit)),
    page: Number(req.query.page),
    total: result.length,
    data: result
  })
}

export const getFollowingsController = async (req: Request, res: Response) => {
  // const {user_id} = req.params
  const {result, total} = await usersService.getFollowings({
    user_id: req.params.user_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  return res.json({
    total_page: Math.ceil(total / Number(req.query.limit)),
    page: Number(req.query.page),
    total: result.length,
    data: result,
  })
}

export const refreshTokenController = async (req: Request<ParamsDictionary, any, RefreshTokenReqBody>, res: Response) => {
  const {user_id} = req.decoded_refresh_token as TokenPayload
  const {refresh_token} = req.body
  const result = await usersService.refreshToken(user_id, refresh_token)
  return res.send({
    message: 'Refresh token success',
    result
  })
}
