import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import moment from 'moment'
import { Pagination, StatusRequestBody } from '~/models/requests/Status.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import statusServices from '~/services/status.services'

export const createStatusController = async (req: Request<ParamsDictionary, any, StatusRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await statusServices.createStatus(user_id, req.body)
  if (!result) {
    return res.status(400).send({
      message: 'Create status failed!!!'
    })
  }
  return res.status(201).send({
    message: 'Create status successfully!!!',
    create_at: moment().diff(result.created_at, 'seconds'),
    data: result
  })
}

export const getStatusController = async (req: Request, res: Response) => {
  const { status_id } = req.params
  const result = await statusServices.increaseView(status_id)
  const status = {
    ...req.status,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.status(200).send({
    message: 'Get status successfully!!!',
    data: status
  })
}

export const getStatusUserController = async (req: Request, res: Response) => {
  const { user_id } = req.params
  const { user_id: user_login } = req.decoded_authorization as TokenPayload
  const { result, total } = await statusServices.getStatusUser({
    user_id,
    user_login,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  return res.status(200).send({
    message: 'Get all status successfully!!!',
    total_page: Math.ceil(total / Number(req.query.limit as string)),
    page: Number(req.query.page as string),
    total: result.length,
    data: result
  })
}

export const editStatusController = async (req: Request<ParamsDictionary, any, StatusRequestBody>, res: Response) => {
  const { status_id } = req.params
  // const body = pick(req.body, ['content', 'type', 'medias', 'mentions', 'hashtags', ' parent_id', 'audience'])
  const result = await statusServices.editStatus(status_id, req.body)
  return res.json({
    message: 'Edit status successfully!!!',
    result: result
  })
}

export const deleteStatusController = async (req: Request, res: Response) => {
  const { status_id } = req.params
  const result = await statusServices.deleteStatus(status_id)
  return res.json({
    message: 'Delete status successfully!!!',
    result: result
  })
}

export const getNewsFeedController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await statusServices.getNewFeeds({
    user_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  res.send({
    message: 'Get news feed successfully!!!',
    total_page: Math.ceil(result.total / Number(req.query.limit as string)),
    page: Number(req.query.page as string),
    total: result.total,
    result: {
      posts: result.status
    }
  })
}
