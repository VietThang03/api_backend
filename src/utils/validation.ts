import express, { NextFunction, Request, Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import HTTP_STATUS from '~/contants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
   await validation.run(req)

    const errors = validationResult(req)

      // Neu khong co loi thi next
      if (errors.isEmpty()) {
        return next()
      }

    const errorsObject = errors.mapped()
    const entityErrors = new EntityError({errors: {}})

    // for...in dung de lap 1 object
    // neu la loi request ko p loi 422 thi next ve request error handler, neu la 422 thi tra ve object errors
    for(const key in errorsObject){
        const {msg} = errorsObject[key]
        if(msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY){
          return next(msg)
        }
        entityErrors.errors[key] = errorsObject[key]
    }

    next(entityErrors)

    // co loi thi res.status(400)
    // res.status(422).json({ errors: errorsObject })
  }
}
