import { Router } from 'express'
import {
  createAlbumController,
  deleteAlbumController,
  getAlbumsUserController,
  getDetailAlbumController,
  updateAlbumController
} from '~/controllers/albums.controllers'
import { albumIdValidator, audienceAlbumValidator, createAlbum } from '~/middlewares/albums.middlewares'
import { paginationValidator } from '~/middlewares/status.middlewares'
import { accessToken_validator, userIdValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const albumRouters = Router()

albumRouters.post(
  '/',
  accessToken_validator,
  verifiedUserValidator,
  createAlbum,
  wrapRequestHandler(createAlbumController)
)
albumRouters.get(
  '/:album_id',
  accessToken_validator,
  verifiedUserValidator,
  albumIdValidator,
  wrapRequestHandler(getDetailAlbumController)
)
albumRouters.put(
  '/:album_id',
  accessToken_validator,
  verifiedUserValidator,
  albumIdValidator,
  wrapRequestHandler(updateAlbumController)
)
albumRouters.delete(
  '/:album_id',
  accessToken_validator,
  verifiedUserValidator,
  albumIdValidator,
  wrapRequestHandler(deleteAlbumController)
)
albumRouters.get(
  '/user/:user_id',
  accessToken_validator,
  verifiedUserValidator,
  userIdValidator,
  paginationValidator,
  // audienceAlbumValidator,
  wrapRequestHandler(getAlbumsUserController)
)

export default albumRouters
