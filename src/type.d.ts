import {Request} from 'express'
import User from './models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.requests'
import Status from './models/schemas/Status.schema'
import Vacation from './models/schemas/Vacation.schema'

// mo rong kieu du lieu cho request
declare module 'express'{
  interface Request{
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    status?: Status
    vacation?: Vacation
  }
}