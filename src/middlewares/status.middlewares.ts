import { options } from "axios";
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, StatusAudience, StatusTypeEnum } from "~/contants/enum";
import HTTP_STATUS from "~/contants/httpStatus";
import { STATUS_MESSAGES } from "~/contants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import database from "~/services/database.services";
import { numberEnumToArray } from "~/utils/others";
import { validate } from "~/utils/validation";

const statusType = numberEnumToArray(StatusTypeEnum)
const statusAudience = numberEnumToArray(StatusAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createStatusValidator = validate(
  checkSchema({
    type:{
      isIn: {
        options: [statusType],
        errorMessage:STATUS_MESSAGES.INAVLID_TYPE
      }
    },
    audience:{
      isIn: {
        options: [statusAudience],
        errorMessage:STATUS_MESSAGES.UNVALID_AUDIENCE
      }
    },
    parent_id:{
      custom:{
        options: (value, {req}) => {
          const type = req.body.type as StatusTypeEnum
          if([StatusTypeEnum.Restatus, StatusTypeEnum.Comment].includes(type) && !ObjectId.isValid(value)){
            throw new Error(STATUS_MESSAGES.PARTENT_ID_MUST_BE_A_VALID_STATUS_ID)
          }
          if(type === StatusTypeEnum.Status && value !== null){
            throw new Error(STATUS_MESSAGES.PARTENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content:{
      isString: true,
      custom: {
        options: (value, {req}) => {
          const type = req.body.type as StatusTypeEnum
          const mentions = req.body.mentions as string[]
          const hashtags = req.body.hashtags as string[]
          if([StatusTypeEnum.Status, StatusTypeEnum.Comment].includes(type) && isEmpty(mentions) && isEmpty(hashtags) && value === '') {
            throw new Error(STATUS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          if(type === StatusTypeEnum.Restatus && value !== ''){
            throw new Error(STATUS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags:{
      isArray: true,
      custom: {
        options: (value, {req}) => {
          // Yêu cầu mỗi phần từ trong array là string
          if(value.some((item: any) => typeof item !== 'string')){
            throw new Error(STATUS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions:{
      isArray: true,
      custom:{
        options: (value, {req}) => {
          // Yêu cầu mỗi phần từ trong array là user_id
          if(value.some((item: any) => !ObjectId.isValid(item))){
            throw new Error(STATUS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias:{
      isArray: true,
      custom:{
        options:(value,{req})=>{
           // Yêu cầu mỗi phần từ trong array là Media Object
           if(value.some((item: any) => {
            return item.url !== 'string' || !mediaTypes.includes(item.type)
           })){
            throw new Error(STATUS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
           }
           return true
        }
      }
    }
  },['body'])
)

export const statusIdValidator = validate(
  checkSchema({
    status_id:{
      custom:{
        options: async (value, {req}) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              message: STATUS_MESSAGES.STATUS_ID_MUST_BE_A_VALID_STATUS_ID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          const status = await database.posts.findOne({
            _id: new ObjectId(value)
          })
          if(!status){
            throw new ErrorWithStatus({
              message: STATUS_MESSAGES.STATUS_ID_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  },['params','body'])
)