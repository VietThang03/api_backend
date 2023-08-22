import { Router } from "express";
import { uploadImageController, uploadSingleImageController, uploadVideoController } from "~/controllers/medias.controllers";
import { accessToken_validator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
const mediasRouter = Router()

mediasRouter.post('/upload-image',accessToken_validator, verifiedUserValidator, wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload-video',accessToken_validator, verifiedUserValidator, wrapRequestHandler(uploadVideoController))
mediasRouter.post('/upload-single-image',accessToken_validator, verifiedUserValidator, wrapRequestHandler(uploadSingleImageController))

export default mediasRouter