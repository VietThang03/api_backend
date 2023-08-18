import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { AlbumAudience, MediaType, UserVerifyStatus } from '~/contants/enum'
import HTTP_STATUS from '~/contants/httpStatus'
import USERS_MESSAGE, { ALBUM_MESSAGES, STATUS_MESSAGES } from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Album from '~/models/schemas/Album.shema'
import database from '~/services/database.services'
import { numberEnumToArray } from '~/utils/others'
import { validate } from '~/utils/validation'

const mediaTypes = numberEnumToArray(MediaType)
const albumAudience = numberEnumToArray(AlbumAudience)


export const createAlbum = validate(
  checkSchema(
    {
      album_name: {
        isString: true,
        isLength: {
          options: {
            max: 1000
          }
        }
      },
      album_description: {
        isString: true,
        isLength: {
          options: {
            max: 2000
          }
        }
      },
      medias:{
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
      },
      audience: {
        isIn: {
          options: [albumAudience],
          errorMessage: STATUS_MESSAGES.UNVALID_AUDIENCE
        }
      }
    },
    ['body']
  )
)

export const albumIdValidator = validate(
  checkSchema({
    album_id:{
      custom:{
        options: async (value, {req}) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              message: ALBUM_MESSAGES.ALBUM_ID_MUST_BE_A_VALID_ALBUM_ID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          const album_id = await database.albums.findOne({
            _id: new ObjectId(value)
          })
          if(!album_id){
            throw new ErrorWithStatus({
              message: ALBUM_MESSAGES.ALBUM_ID_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          };
          (req as Request).album = album_id
          return true
        }
      }
    }
  },['params', 'body'])
)

export const audienceAlbumValidator = async (req: Request, res: Response, next: NextFunction) => {
  const album = await database.albums.findOne({
    user_id: new ObjectId(req.params.user_id),
  })
  if(!album){
    throw new ErrorWithStatus({
      message: ALBUM_MESSAGES.ALBUM_ID_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (album.audience === AlbumAudience.Private) {
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGE.USER_NOT_FOUND
      })
    }

    const author = await database.users.findOne({
      _id: new ObjectId(album.user_id)
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
        message: ALBUM_MESSAGES.ALBUM_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDEN
      })
    }
  }
  next()
}
