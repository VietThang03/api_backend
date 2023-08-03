import { Router } from "express";
import { uploadImageController, uploadVideoController } from "~/controllers/medias.controllers";
import { accessToken_validator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
const mediasRouter = Router()

mediasRouter.post('/upload-image',accessToken_validator, verifiedUserValidator, wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video',accessToken_validator, verifiedUserValidator, wrapRequestHandler(uploadVideoController))

export default mediasRouter