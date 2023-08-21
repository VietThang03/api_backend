import {Router} from 'express'
import { countCommentsController, createCommentController, deleteCommentController, editCommentController, getCommentsStatusController } from '~/controllers/comments.controllers'
import { commentsValidator } from '~/middlewares/comments.middlewares'
import { paginationValidator, statusIdValidator } from '~/middlewares/status.middlewares'
import { accessToken_validator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const commentsRouter = Router()

commentsRouter.post('/', accessToken_validator, verifiedUserValidator,statusIdValidator,commentsValidator, wrapRequestHandler(createCommentController))
commentsRouter.get('/:status_id', accessToken_validator, verifiedUserValidator, statusIdValidator, paginationValidator, wrapRequestHandler(getCommentsStatusController))
commentsRouter.put('/:comment_id', accessToken_validator, verifiedUserValidator, wrapRequestHandler(editCommentController))
commentsRouter.delete('/:comment_id', accessToken_validator, verifiedUserValidator, wrapRequestHandler(deleteCommentController))
commentsRouter.get('/count/:status_id', accessToken_validator, verifiedUserValidator, statusIdValidator, wrapRequestHandler(countCommentsController))

export default commentsRouter