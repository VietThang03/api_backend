import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/contants/enum"

export interface RegisterRequestBody{
  name: string
  password: string
  email: string
  confirm_password: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LogoutReqBody{
  refresh_token: string
}
export interface RefreshTokenReqBody{
  refresh_token: string
}

export interface ResetPasswordReqBody{
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UpdateProfileReqBody{
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  username?: string
  website?: string
  avatar?: string
  cover_photo?: string
}

export interface ChangePasswordReqBody{
  old_password: string
  new_password: string
  confirm_new_password: string
}

export interface FollowReqBody{
  followed_user_id: string
}