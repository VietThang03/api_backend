import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { CommentReqBody } from "~/models/requests/Comment.request";
import { TokenPayload } from "~/models/requests/User.requests";
import commentServices from "~/services/comments.services";

export const createCommentController = async (req: Request<ParamsDictionary, any, CommentReqBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await commentServices.createComment(user_id, req.body)
  res.status(201).send({
    message: 'Comment created',
    data: result
  })
}

export const getCommentsStatusController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const result = await commentServices.getCommentsStatus(req.params.status_id)
  res.status(200).send({
    message: 'Get comments successfully',
    data: result
  })
}

export const editCommentController = async (req: Request, res: Response) => {
  const {comment} = req.body
  await commentServices.editComment(req.params.comment_id, comment)
  res.status(200).send({
    message: 'Edit comment successfully'
  })
}

export const deleteCommentController = async (req: Request, res: Response) => {
  await commentServices.deleteComment(req.params.comment_id)
  res.status(200).send({
    message: 'Delete comment successfully'
  })
}