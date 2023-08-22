import { options } from 'axios'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, StatusAudience, StatusTypeEnum, UserVerifyStatus } from '~/contants/enum'
import HTTP_STATUS from '~/contants/httpStatus'
import USERS_MESSAGE, { STATUS_MESSAGES } from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Status from '~/models/schemas/Status.schema'
import database from '~/services/database.services'
import { numberEnumToArray } from '~/utils/others'
import { validate } from '~/utils/validation'

const statusType = numberEnumToArray(StatusTypeEnum)
const statusAudience = numberEnumToArray(StatusAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createStatusValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [statusType],
          errorMessage: STATUS_MESSAGES.INAVLID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [statusAudience],
          errorMessage: STATUS_MESSAGES.UNVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as StatusTypeEnum
            if ([StatusTypeEnum.Restatus, StatusTypeEnum.Comment].includes(type) && !ObjectId.isValid(value)) {
              throw new Error(STATUS_MESSAGES.PARTENT_ID_MUST_BE_A_VALID_STATUS_ID)
            }
            if (type === StatusTypeEnum.Status && value !== null) {
              throw new Error(STATUS_MESSAGES.PARTENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        trim: true,
        notEmpty:{
          errorMessage: STATUS_MESSAGES.CONTENT_IS_REQUIRED
        },
        custom: {
          options: (value, { req }) => {           
            const type = req.body.type as StatusTypeEnum
            const mentions = req.body.mentions as string[]
            const hashtags = req.body.hashtags as string[]
            if (
              [StatusTypeEnum.Status, StatusTypeEnum.Comment].includes(type) &&
              isEmpty(mentions) &&
              isEmpty(hashtags) &&
              value === ''
            ) {
              throw new Error(STATUS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }
            if (type === StatusTypeEnum.Restatus && value !== '') {
              throw new Error(STATUS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
            return true
          }
        },
        isLength: {
          options: {
            max: 65000
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần từ trong array là string
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(STATUS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }
            return true
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
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            // Yêu cầu mỗi phần từ trong array là Media Object
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
              })
            ) {
              throw new Error(STATUS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const statusIdValidator = validate(
  checkSchema(
    {
      status_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: STATUS_MESSAGES.STATUS_ID_MUST_BE_A_VALID_STATUS_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }  
            const [status] = await database.posts
              .aggregate<Status>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          email: '$$mention.email',
                          username: '$$mention.username'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'status_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'status_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'status_id',
                    as: 'comments'
                  }
                },
                {
                  $addFields: {
                    bookmark: {
                      $size: '$bookmarks'
                    },
                    like: {
                      $size: '$likes'
                    },
                    comment: {
                      $size: '$comments'
                    }
                  }
                }
              ])
              .toArray()
            if (!status) {
              throw new ErrorWithStatus({
                message: STATUS_MESSAGES.STATUS_ID_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            ;(req as Request).status = status
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const audienceStatusValidator = async (req: Request, res: Response, next: NextFunction) => {
  const status = req.status as Status
  if (status.audience === StatusAudience.Private) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGE.USER_NOT_FOUND
      })
    }

    const author = await database.users.findOne({
      _id: new ObjectId(status.user_id)
    })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGE.USER_NOT_FOUND
      })
    }

    const { user_id } = req.decoded_authorization
    if (!author._id.equals(user_id)) {
      throw new ErrorWithStatus({
        message: STATUS_MESSAGES.STATUS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDEN
      })
    }
  }
  next()
}

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
