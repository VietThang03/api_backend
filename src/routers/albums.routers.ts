import {Router} from 'express'
import { createAlbumController, getAlbumsUserController, getDetailAlbumController, updateAlbumController } from '~/controllers/albums.controllers'
import { albumIdValidator, createAlbum } from '~/middlewares/albums.middlewares'
import { accessToken_validator, userIdValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const albumRouters = Router()

albumRouters.post('/', accessToken_validator, verifiedUserValidator, createAlbum, wrapRequestHandler(createAlbumController))
albumRouters.get('/:album_id', accessToken_validator, verifiedUserValidator,albumIdValidator, wrapRequestHandler(getDetailAlbumController))
albumRouters.put('/:album_id', accessToken_validator, verifiedUserValidator,albumIdValidator, wrapRequestHandler(updateAlbumController))
albumRouters.delete('/:album_id', accessToken_validator, verifiedUserValidator,albumIdValidator, wrapRequestHandler(createAlbumController))
albumRouters.get('/user/:user_id', accessToken_validator, verifiedUserValidator, userIdValidator, wrapRequestHandler(getAlbumsUserController))

export default albumRouters