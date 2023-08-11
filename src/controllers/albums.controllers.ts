import { Request, Response } from "express";
import {ParamsDictionary} from 'express-serve-static-core'
import { AlbumRequestBody } from "~/models/requests/Album.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import albumServices from "~/services/albums.services";

export const createAlbumController = async (req: Request<ParamsDictionary, any, AlbumRequestBody>, res: Response) => {
  const {user_id} = req.decoded_authorization as TokenPayload
  const result = await albumServices.createAlbum(user_id, req.body)
  res.status(201).send({
    message: 'Create album successfully',
    data: result
  })
}

export const getDetailAlbumController = async (req: Request, res: Response) => {
  const {album_id} = req.params
  const result = await albumServices.getDetailAlbum(album_id)
  res.status(200).send({
    message: 'Get detail album successfully',
    data: result
  })
}

export const updateAlbumController = async (req: Request, res: Response) => {
  const {album_id} = req.params
  const result = await albumServices.updateAlbum(album_id, req.body)
  res.status(200).send({
    message: 'Update album successfully',
    data: result
  })
}

export const deleteAlbumController = async (req: Request, res: Response) => {
  const {album_id} = req.params
  const result = await albumServices.deleteAlbum(album_id)
  res.status(200).send({
    message: 'Delete album successfully',
    data: result
  })
}

export const getAlbumsUserController = async (req: Request, res: Response) => {
  const {user_id} = req.params
  const result = await albumServices.getAlbumsUser(user_id)
  res.status(200).send({
    message: 'Get albums by user successfully',
    data: result
  })
}