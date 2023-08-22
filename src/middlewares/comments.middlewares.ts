import { checkSchema } from "express-validator";
import { validate } from "~/utils/validation";

export const commentsValidator = validate(
  checkSchema({
    comment:{
      isString: true,
      notEmpty:{
        errorMessage: 'Comment is required'
      },
      trim: true,
      isLength:{
        options: {
          max: 1000
        }
      }
    }
  },['body'])
)