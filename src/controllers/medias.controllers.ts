import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/contants/dir'
import mediasService from '~/services/medias.services'
// import { handleUploadImage } from '~/utils/file'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.handleUploadImage(req)
  return res.json({ result: result })
}

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadSingleImage(req)
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

export const serverVideoStreamController = async (req: Request, res: Response) => {
  const range = req.headers.range
  if(!range){
    return res.status(400).send('Requires range header')
  }
  const {name} = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10^6 bytes
  // tinh dung luong video
  const videoSize = fs.statSync(videoPath).size
  // Dung luong video cho moi phan doan stream
  const CHUNK_SIZE = 10 * 10 ** 6
  // Lay gia tri byte bat dau tu header range
  const start = Number(range.replace(/\D/g, ''))
  // Lay gia tri byte ket thuc tu header range
  // end luon luon p nho hon video size
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  // dung luong thuc te cho moi doan video stream
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(206, headers)
  const videoStream = fs.createReadStream(videoPath, {start, end})
  videoStream.pipe(res)
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasService.uploadVideo(req)
  return res.json({ result: url})
}
