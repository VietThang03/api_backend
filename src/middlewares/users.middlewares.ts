import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/contants/enum'
import HTTP_STATUS from '~/contants/httpStatus'
import USERS_MESSAGE from '~/contants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import database from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/hashPassword'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_VALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await database.users.findOne({ email: value, password: hashPassword(req.body.password) })
          // neu user = null(Ko tim thay user) thi throw error, neu ko null(tim thay user) thi truyen user qua controller
          if (user === null) {
            throw new Error(USERS_MESSAGE.EMAIL_OF_PASSWORD_IS_INCORRECT)
          }
          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
      },
      isLength: {
        options: {
          min: 8,
          max: 100
        },
        errorMessage: USERS_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
      },
      trim: true,
      isString: {
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
          minNumbers: 1
        },
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
      }
      // errorMessage: 'password invalid'
    }
  },
  ['body']
)

export const registerValidator = checkSchema(
  {
    name: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.NAME_IS_REQUIRED
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USERS_MESSAGE.NAME_LENGHT_MUST_BE_FROM_1_TO_100
      },
      isString: {
        errorMessage: USERS_MESSAGE.NAME_MUST_BE_A_STRING
      }
    },
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGE.EMAIL_IS_VALID
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await usersService.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error(USERS_MESSAGE.EMAIL_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
      },
      isLength: {
        options: {
          min: 8,
          max: 100
        },
        errorMessage: USERS_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
      },
      trim: true,
      isString: {
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
          minNumbers: 1
        },
        errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
      }
      // errorMessage: 'password invalid'
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isLength: {
        options: {
          min: 8,
          max: 100
        },
        errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
      },
      trim: true,
      isString: {
        errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minSymbols: 1,
          minNumbers: 1
        },
        errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
          }
          return true
        }
      }
      // errorMessage: 'confirm password invalid'
    }
    // date_of_birth: {
    //   isISO8601: {
    //     options: {
    //       strict: true,
    //       strictSeparator: true
    //     },
    //     errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
    //   }
    // }
  },
  ['body']
)

export const accessToken_validator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            // neu ko truyen len value thi de ''
            const access_token = (value || '').split(' ')[1]
            // console.log(access_token)
            if (!access_token) {
              throw new ErrorWithStatus({ message: 'Access token is required', status: HTTP_STATUS.UNAUTHORIZED })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Refresh token is required',
                status: 401
              })
            }
            try {
              // 2 await ko lien quan den nhau, co the dung Promise.all
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                database.refreshToken.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: 'Refresh token invalid',
                  status: 401
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
              // console.log(decoded_refresh_token)
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: 401
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Email verify is required',
                status: 401
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: 401
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const user = await database.users.findOne({ email: value })
            if (user === null) {
              throw new Error('Email does not exist')
            }
            req.user = user
            return true
          }
        },
        trim: true
      }
    },
    ['body']
  )
)

export const verifyforgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token

              const { user_id } = req.decoded_forgot_password_token as TokenPayload
              const user = await database.users.findOne({
                _id: new ObjectId(user_id)
              })
              if (!user) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGE.USER_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              if (user.forgot_password_token === '') {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_ALREADY_VERIFIED_BEFORE,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: 401
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 8,
            max: 100
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
        },
        trim: true,
        isString: {
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
        }
        // errorMessage: 'password invalid'
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 8,
            max: 100
          },
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
        },
        trim: true,
        isString: {
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
        // errorMessage: 'confirm password invalid'
      },
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: 401
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await database.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return next(
      new ErrorWithStatus({
        message: 'User not found',
        status: HTTP_STATUS.NOT_FOUND
      })
    )
    // return res.status(404).json({
    //   message: 'User not found'
    // })
  }
  if (user.verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: 'User not verify',
        status: HTTP_STATUS.FORBIDEN
      })
    )
  }
  next()
}

export const updateProfileValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isLength: {
          options: {
            min: 0,
            max: 100
          },
          errorMessage: USERS_MESSAGE.NAME_LENGHT_MUST_BE_FROM_1_TO_100
        },
        isString: {
          errorMessage: USERS_MESSAGE.NAME_MUST_BE_A_STRING
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
        },
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.BIO_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 0,
            max: 200
          },
          errorMessage: USERS_MESSAGE.BIO_LENGHT_MUST_BE_FROM_1_TO_200
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.LOCATION_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 0,
            max: 200
          },
          errorMessage: USERS_MESSAGE.LOCATION_LENGHT_MUST_BE_FROM_1_TO_200
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.WEBSITE_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 0,
            max: 200
          },
          errorMessage: USERS_MESSAGE.WEBSITE_LENGHT_MUST_BE_FROM_1_TO_200
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 0,
            max: 50
          },
          errorMessage: USERS_MESSAGE.USERNAME_LENGHT_MUST_BE_FROM_1_TO_50
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.IMAGE_URL_MUST_BE_A_STRING
        },
        trim: true
        // isLength: {
        //   options: {
        //     min: 1,
        //     max: 200
        //   },
        //   errorMessage: USERS_MESSAGE.WEBSITE_LENGHT_MUST_BE_FROM_1_TO_200
        // }
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGE.IMAGE_URL_MUST_BE_A_STRING
        },
        trim: true
        // isLength: {
        //   options: {
        //     min: 1,
        //     max: 200
        //   },
        //   errorMessage: USERS_MESSAGE.WEBSITE_LENGHT_MUST_BE_FROM_1_TO_200
        // }
      }
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 8,
            max: 100
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
        },
        trim: true,
        isString: {
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: async (value, { req }) => {
            const { user_id } = (req as Request).decoded_authorization as TokenPayload
            const user = await database.users.findOne({
              _id: new ObjectId(user_id)
            })
            if (!user) {
              throw new ErrorWithStatus({
                message: 'User not found',
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const { password } = user
            const isMatch = hashPassword(value) === password
            if (!isMatch) {
              throw new ErrorWithStatus({
                message: 'Old password invalid!!!',
                status: HTTP_STATUS.NOT_FOUND
              })
            }
          }
        }
        // errorMessage: 'password invalid'
      },
      new_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 8,
            max: 100
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
        },
        trim: true,
        isString: {
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG
        }
        // errorMessage: 'password invalid'
      },
      confirm_new_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 8,
            max: 100
          },
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGHT_MUST_BE_FROM_8_TO_100
        },
        trim: true,
        isString: {
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minSymbols: 1,
            minNumbers: 1
          },
          errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.new_password) {
              throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
            }
            return true
          }
        }
        // errorMessage: 'confirm password invalid'
      }
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.INVALID_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const user = await database.users.findOne({
              _id: new ObjectId(value)
            })
            if (user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.INVALID_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const user = await database.users.findOne({
              _id: new ObjectId(value)
            })
            if (user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['params']
  )
)

export const userIdValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.USER_ID_MUST_BE_A_VALID_USER_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const status = await database.posts.findOne({
              user_id: new ObjectId(value)
            })
            if (!status) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.USER_ID_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
