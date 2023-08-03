import { Request, Response } from "express"
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeRequestBody } from "~/models/requests/Like.requests"
import { TokenPayload } from "~/models/requests/User.requests"
import likeServices from "~/services/likes.services"

export const likesController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await likeServices.likesStatus(user_id, req.body.status_id)
  return res.status(200).send({
    message:'Like status successfully!!!',
    data:result
  })
}

export const unLikesController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  await likeServices.unLikesStatus(user_id, req.params.status_id)
  return res.status(200).send({
    message:'Unlike status successfully!!!'
  })
}