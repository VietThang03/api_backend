import { Router } from 'express'
import { createStatusController, getStatusController } from '~/controllers/status.controllers'
import { createStatusValidator, statusIdValidator } from '~/middlewares/status.middlewares'
import { accessToken_validator, verifiedUserValidator } from '~/middlewares/users.middlewares'
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
  wrapRequestHandler(getStatusController)
)

export default statusRouter
