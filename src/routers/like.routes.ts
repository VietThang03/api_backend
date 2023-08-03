import {Router} from 'express'
import { likesController, unLikesController } from '~/controllers/likes.controllers'
import { accessToken_validator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

likesRouter.post('', accessToken_validator, verifiedUserValidator, wrapRequestHandler(likesController))
likesRouter.delete('/post/:status_id', accessToken_validator, verifiedUserValidator, wrapRequestHandler(unLikesController))

export default likesRouter