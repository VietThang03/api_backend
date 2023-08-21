import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeRequestBody } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import likeServices from '~/services/likes.services'

export const likesController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeServices.likesStatus(user_id, req.body.status_id)
  return res.status(200).send({
    message: 'Like status successfully!!!',
    data: result
  })
}

export const unLikesController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likeServices.unLikesStatus(user_id, req.params.status_id)
  return res.status(200).send({
    message: 'Unlike status successfully!!!'
  })
}

export const getLikesController = async (req: Request, res: Response) => {
  const { result, total } = await likeServices.getLikeStatus({
    status_id: req.params.status_id,
    limit: Number(req.query.limit),
    page: Number(req.query.page)
  })
  return res.status(200).send({
    message: 'Get like status successfully!!!',
    total: total,
    data: result
  })
}

export const countLikesController = async (req: Request, res: Response) => {
  const total  = await likeServices.countLikes(req.params.status_id)
  return res.status(200).send({
    message: 'Count like status successfully!!!',
    total: total
  })
}
