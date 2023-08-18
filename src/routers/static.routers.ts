import {Router} from 'express'
import { serverImageController, serverVideoStreamController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video-stream/:name', serverVideoStreamController)


export default staticRouter