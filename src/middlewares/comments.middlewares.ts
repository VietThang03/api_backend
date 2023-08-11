import { checkSchema } from "express-validator";
import { validate } from "~/utils/validation";

export const commentsValidator = validate(
  checkSchema({
    comment:{
      isString: true,
      isLength:{
        options: {
          max: 1000
        }
      }
    }
  },['body'])
)