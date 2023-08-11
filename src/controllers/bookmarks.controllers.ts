import { Request, Response } from "express";
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkRequestBody } from "~/models/requests/Bookmark.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import bookmarkServices from "~/services/bookmarks.services";

export const bookmarksController = async (req: Request<ParamsDictionary, any, BookmarkRequestBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await bookmarkServices.bookmarksStatus(user_id, req.body.status_id)
  return res.status(200).send({
    message:'Bookmark status successfully!!!',
    data:result
  })
}

export const unbookmarksController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  await bookmarkServices.unBookmarksStatus(user_id, req.params.status_id)
  return res.status(200).send({
    message:'Unbookmark status successfully!!!'
  })
}

export const getBookmarksUserController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await bookmarkServices.getBookmarksUser(user_id)
  return res.status(200).send({
    message:'Get bookmarks user successfully!!!',
    data:result
  })
}