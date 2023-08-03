import { NextFunction, Request, Response } from "express";
import { omit } from "lodash";
import HTTP_STATUS from "~/contants/httpStatus";
import { ErrorWithStatus } from "~/models/Errors";

// tat ca cac loi (ngoai tru loi validate da cau hinh tu trc), se dua ve error request handler de xu ly

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if(err instanceof ErrorWithStatus){
    return res.status(err.status).json(omit(err, ['status']))
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, {
      enumerable: true,
    })
  }
  )
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}