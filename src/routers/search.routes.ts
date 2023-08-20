import {Router} from 'express'
import { searchController } from '~/controllers/search.controllers'
import { paginationValidator } from '~/middlewares/status.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouters = Router()

searchRouters.post('/', searchController)

export default searchRouters