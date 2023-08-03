import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/contants/dir'
import mediasService from '~/services/medias.services'
// import { handleUploadImage } from '~/utils/file'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadImage(req)
  return res.json({ result: result })
}

export const serverImageController = async (req: Request, res: Response) => {
  const {name} = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if(err){
      res.status((err as any).status).send('Not found!!!')
    }
  })
}

export const serverVideoController = async (req: Request, res: Response) => {
  const {name} = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err) => {
    if(err){
      res.status((err as any).status).send('Not found!!!')
    }
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({ url: url})
}
