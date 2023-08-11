import {Router} from 'express'
import { searchController } from '~/controllers/search.controllers'

const searchRouters = Router()

searchRouters.post('/', searchController)

export default searchRouters