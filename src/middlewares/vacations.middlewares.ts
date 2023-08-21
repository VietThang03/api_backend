import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { StatusAudience, UserVerifyStatus, VacationMentions } from '~/contants/enum'
import HTTP_STATUS from '~/contants/httpStatus'
import USERS_MESSAGE, { STATUS_MESSAGES } from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Vacation from '~/models/schemas/Vacation.schema'
import database from '~/services/database.services'
import { numberEnumToArray } from '~/utils/others'
import { validate } from '~/utils/validation'

const vacationMentions = numberEnumToArray(VacationMentions)

export const createVacationValidator = validate(
  checkSchema({
    vacation_name: {
      isString: true,
      notEmpty:{
        errorMessage: STATUS_MESSAGES.VACATION_NAME_IS_REQUIRED
      },
      trim: true,
      isLength: {
        options: {
          max: 1000
        }
      }
    },
    vacation_description: {
      isString: true,
      notEmpty:{
        errorMessage: STATUS_MESSAGES.VACATION_DESCRIPTION_IS_REQUIRED
      },
      trim: true,
      isLength: {
        options: {
          max: 2000
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // Yêu cầu mỗi phần từ trong array là user_id
          if (value.some((item: any) => !ObjectId.isValid(item))) {
            throw new Error(STATUS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    audience: {
      isIn: {
        options: [vacationMentions],
        errorMessage: STATUS_MESSAGES.UNVALID_AUDIENCE
      }
    },
    vacation_intro: {
      isString: true,
      trim: true,
      notEmpty:{
        errorMessage: STATUS_MESSAGES.VACATION_INTRO_IS_REQUIRED
      },
      isLength: {
        options: {
          max: 1000
        }
      }
    },
    vacation_avatar:{
      isString: true,
      trim: true,
      notEmpty:{
        errorMessage: STATUS_MESSAGES.VACATION_AVATAR_IS_REQUIRED
      }
    }
  })
)

export const vacationIdValidator = validate(
  checkSchema({
    vacation_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({
              message: STATUS_MESSAGES.VACATION_ID_MUST_BE_A_VALID_STATUS_ID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }

          const vacation_id = await database.vacations.findOne({
            _id: new ObjectId(value)
          })

          if (!vacation_id) {
            throw new ErrorWithStatus({
              message: STATUS_MESSAGES.VACATION_ID_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)

export const audienceVacationValidator = async (req: Request, res: Response, next: NextFunction) => {
  const {vacation_id} = req.params
  const vacation = await database.vacations.findOne({
    _id: new ObjectId(vacation_id)
  })
  // console.log(vacation)
  if(!vacation) {
    throw new ErrorWithStatus({
      message: STATUS_MESSAGES.VACATION_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (vacation.audience === VacationMentions.Mentions) {
    // Kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_FOUND,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    const author = await database.users.findOne({
      _id: new ObjectId(vacation.user_id)
    })

    // Kiểm tra tài khoản tác giả có ổn (bị khóa hay bị xóa chưa) không
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra người xem vacation này có nằm trong danh sách được tag không
    const {user_id} = req.decoded_authorization
    const isInVacationMentions = vacation.mentions.some((user_mention) => user_mention.equals(user_id))

     // Nếu bạn không phải là tác giả và không nằm trong vacation mentions thì quăng lỗi
    if(!author._id.equals(user_id) && !isInVacationMentions) {
      throw new ErrorWithStatus({
        message: STATUS_MESSAGES.VACATION_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDEN
      })
    }

  }
  next()
}
