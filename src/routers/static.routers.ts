import {Router} from 'express'
import { serverImageController, serverVideoController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:name', wrapRequestHandler(serverImageController))
staticRouter.get('/video-stream/:name', wrapRequestHandler(serverVideoController))


export default staticRouter