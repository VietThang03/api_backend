import { Request, Response } from "express"
import { ParamsDictionary } from "express-serve-static-core";
import { StatusVacationRequest } from "~/models/requests/Status.requests";
import { TokenPayload } from "~/models/requests/User.requests"
import { VacationReqBody } from "~/models/requests/Vacation.requests";
import vacationServices from "~/services/vacations.services"

export const createVacationController = async (req: Request<ParamsDictionary, any, VacationReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
    const result = await vacationServices.createVacation(user_id, req.body)
    res.status(201).send({
      message: 'Create vacation successfully',
      data: result
    })
}

export const editVacationController = async (req: Request, res: Response) => {
  const { vacation_id } = req.params
  const result = await vacationServices.editVacation(vacation_id, req.body)
  res.status(200).send({
    message: 'Edit vacation successfully',
    data: result
  })
}

export const deleteVacationController = async (req: Request, res: Response) => {
  const { vacation_id } = req.params
  const result = await vacationServices.deleteVacation(vacation_id)
  res.status(200).send({
    message: 'Delete vacation successfully',
    data: result
  })
}

export const getDetailVacationController = async (req: Request, res: Response) => {
  const { vacation_id } = req.params
  const result = await vacationServices.getDetailVacation(vacation_id)
  res.status(200).send({
    message: 'Get detail vacation successfully',
    data: result
  })
}

export const statusVacationController = async (req: Request<ParamsDictionary, any, StatusVacationRequest>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await vacationServices.statusVacation(user_id, req.body)
  res.status(200).send({
    message: 'Create status vacation successfully',
    data: result
  })
}

export const getVacationUserController = async (req: Request, res: Response) => {
  const { user_id } = req.params
  const {result, total} = await vacationServices.getVacationUser({
    user_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  res.status(200).send({
    message: 'Get vacation user successfully',
    total_page: Math.ceil(total / Number(req.query.limit as string)),
    page: Number(req.query.page as string),
    total: result.length,
    data: result
  })
}

export const getVacationStatusController = async (req: Request, res: Response) => {
  const { vacation_id } = req.params
  const {result, total} = await vacationServices.getVacationStatus({
    vacation_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  res.status(200).send({
    message: 'Get vacation status successfully',
    total_page: Math.ceil(total / Number(req.query.limit as string)),
    page: Number(req.query.page as string),
    total: result.length,
    data: result
  })
}

export const getNewFeedsVacationController = async (req: Request, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await vacationServices.getNewFeedsVacation({
    user_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  res.status(200).send({
    message: 'Get new feeds vacation successfully',
    result:{
       total_page: Math.ceil(result.total / Number(req.query.limit as string)),
       page: Number(req.query.page as string),
       total: Number(req.query.limit as string),
       vacations: result.vacation
    }
  })
}

export const getPostsVacationController = async (req: Request, res: Response) => {
  const {vacation_id} = req.params
  const result = await vacationServices.getPostsVacation({
    vacation_id,
    limit: Number(req.query.limit as string),
    page: Number(req.query.page as string)
  })
  res.status(200).send({
    message: 'Get posts vacation successfully',
    data: result
  })
}

export const getRandomVacationController = async (req: Request, res: Response) => {
  const result = await vacationServices.getRandomVacations()
  res.status(200).send({
    message: 'Get random vacation successfully',
    data: result
  })
}

export const searchUsersVacationController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const {users_data, total} = await vacationServices.searchUsersVacation({
    limit,
    page,
    users: req.query.users as string
  })
  res.status(200).send({
    message: 'Get search users vacation successfully',
    total_page: Math.ceil(total / limit),
    page: page,
    total: total,
    data: users_data
  })
}