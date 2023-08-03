import HTTP_STATUS from "~/contants/httpStatus";
import USERS_MESSAGE from "~/contants/messages";

// tao ra 2class de chuan hoa, khi error dc tra ve luon luon dung dinh dang

type ErrorsType = Record<string, {
  msg: string,
  [key: string]: any
}>

export class ErrorWithStatus{
  message: string
  status: number
  constructor({message, status} : {message: string; status: number}){
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors:  ErrorsType
  constructor({message = USERS_MESSAGE.VALIDATION_ERROR,errors} : {message?:string; errors: ErrorsType}){
    super({message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY})
    this.errors = errors
  }

}