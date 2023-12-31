import { Router } from 'express'
import {
  createVacationController,
  deleteVacationController,
  editVacationController,
  getDetailVacationController,
  getNewFeedsVacationController,
  getPostsVacationController,
  getRandomVacationController,
  getVacationUserController,
  searchUsersVacationController,
  statusVacationController
} from '~/controllers/vacations.controllers'
import { createStatusValidator, paginationValidator } from '~/middlewares/status.middlewares'
import { accessToken_validator, userIdValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import {
  audienceVacationValidator,
  createVacationValidator,
  vacationIdValidator
} from '~/middlewares/vacations.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const vacationRouters = Router()

vacationRouters.post(
  '/',
  accessToken_validator,
  verifiedUserValidator,
  createVacationValidator,
  wrapRequestHandler(createVacationController)
)

vacationRouters.get(
  '/random',
  accessToken_validator,
  verifiedUserValidator,
  wrapRequestHandler(getRandomVacationController)
)

vacationRouters.put(
  '/:vacation_id',
  accessToken_validator,
  verifiedUserValidator,
  createVacationValidator,
  wrapRequestHandler(editVacationController)
)

vacationRouters.delete(
  '/:vacation_id',
  accessToken_validator,
  verifiedUserValidator,
  wrapRequestHandler(deleteVacationController)
)

vacationRouters.get(
  '/:vacation_id',
  accessToken_validator,
  verifiedUserValidator,
  wrapRequestHandler(audienceVacationValidator),
  wrapRequestHandler(getDetailVacationController)
)

vacationRouters.post(
  '/vacation-status',
  accessToken_validator,
  verifiedUserValidator,
  vacationIdValidator,
  createStatusValidator,
  wrapRequestHandler(statusVacationController)
)

vacationRouters.get(
  '/vacation-user/:user_id',
  accessToken_validator,
  verifiedUserValidator,
  userIdValidator,
  wrapRequestHandler(getVacationUserController)
)

vacationRouters.get(
  '/vacation-posts/:vacation_id',
  accessToken_validator,
  verifiedUserValidator,
  vacationIdValidator,
  wrapRequestHandler(getVacationUserController)
)

vacationRouters.get(
  '/',
  accessToken_validator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(getNewFeedsVacationController)
)

vacationRouters.get(
  '/posts-list/:vacation_id',
  accessToken_validator,
  verifiedUserValidator,
  vacationIdValidator,
  wrapRequestHandler(getPostsVacationController)
)

vacationRouters.post('/mentions-users', accessToken_validator, verifiedUserValidator,paginationValidator, wrapRequestHandler(searchUsersVacationController))

export default vacationRouters
