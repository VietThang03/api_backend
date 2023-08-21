import {Router} from 'express'
import { countLikesController, getLikesController, likesController, unLikesController } from '~/controllers/likes.controllers'
import { statusIdValidator } from '~/middlewares/status.middlewares'
import { accessToken_validator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

likesRouter.post('', accessToken_validator, verifiedUserValidator, wrapRequestHandler(likesController))
likesRouter.delete('/post/:status_id', accessToken_validator, verifiedUserValidator,statusIdValidator, wrapRequestHandler(unLikesController))
likesRouter.get('/:status_id', accessToken_validator, verifiedUserValidator, statusIdValidator, wrapRequestHandler(getLikesController))
likesRouter.get('/count/:status_id', accessToken_validator, verifiedUserValidator, statusIdValidator, wrapRequestHandler(countLikesController))

export default likesRouter