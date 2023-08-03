import { Request, Response } from "express";
import { ParamsDictionary } from 'express-serve-static-core'
import { StatusRequestBody } from "~/models/requests/Status.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import statusServices from "~/services/status.services";

export const createStatusController = async(req: Request<ParamsDictionary, any, StatusRequestBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await statusServices.createStatus(user_id, req.body)
  return res.status(201).send(
    {
      message:'Create status successfully!!!',
      data:result
    }
  )
}

export const getStatusController = async(req: Request, res: Response) => {
  const {status_id} = req.params
  const result = await statusServices.getStatus(status_id)
  return res.status(200).send(
    {
      message:'Get status successfully!!!',
      data:result
    }
  )
}