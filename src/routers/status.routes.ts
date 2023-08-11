import { Router } from 'express'
import {
  createStatusController,
  getStatusUserController,
  getStatusController,
  editStatusController,
  deleteStatusController,
  getNewsFeedController
} from '~/controllers/status.controllers'
import {
  audienceStatusValidator,
  createStatusValidator,
  paginationValidator,
  statusIdValidator
} from '~/middlewares/status.middlewares'
import { accessToken_validator, userIdValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const statusRouter = Router()

statusRouter.post(
  '/',
  accessToken_validator,
  verifiedUserValidator,
  createStatusValidator,
  wrapRequestHandler(createStatusController)
)

statusRouter.get(
  '/:status_id',
  accessToken_validator,
  verifiedUserValidator,
  statusIdValidator,
  wrapRequestHandler(audienceStatusValidator),
  wrapRequestHandler(getStatusController)
)

statusRouter.get(
  '/status/:user_id',
  accessToken_validator,
  verifiedUserValidator,
  userIdValidator,
  wrapRequestHandler(getStatusUserController)
)

statusRouter.put(
  '/:status_id',
  accessToken_validator,
  verifiedUserValidator,
  statusIdValidator,
  wrapRequestHandler(editStatusController)
)
statusRouter.delete(
  '/:status_id',
  accessToken_validator,
  verifiedUserValidator,
  statusIdValidator,
  wrapRequestHandler(deleteStatusController)
)

statusRouter.get(
  '/',
  accessToken_validator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(getNewsFeedController)
)

export default statusRouter
