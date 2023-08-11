import {Router} from 'express'
import { bookmarksController, getBookmarksUserController, unbookmarksController } from '~/controllers/bookmarks.controllers'
import { accessToken_validator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

bookmarksRouter.post('', accessToken_validator, verifiedUserValidator, wrapRequestHandler(bookmarksController))
bookmarksRouter.delete('/post/:status_id', accessToken_validator, verifiedUserValidator, wrapRequestHandler(unbookmarksController))
bookmarksRouter.get('/:user_id', accessToken_validator, verifiedUserValidator, wrapRequestHandler(getBookmarksUserController))

export default bookmarksRouter