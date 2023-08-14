import { Request } from 'express'
import path from 'path'
import fs from 'fs'
import 'dotenv/config'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/contants/dir'
import { getNameFormFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { isProduction } from '~/contants/config'
import { type } from 'os'
import { MediaType } from '~/contants/enum'
import { Media } from '~/models/Media/Media'
import { uploadFileToS3 } from '~/utils/s3'
import mime from 'mime'
import fsPromise from 'fs/promises'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    // trong truong hop upload nhieu file, khong muon doi await tung file => Dung Promise.all
    // map se tra ve 1 array => cung type voi File[] (map trong Promise se tra ve 1 array Promise)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        // sau khi chuyen doi anh thi dua ve thu muc uploads
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          fileName: newFullFileName,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([
          fsPromise.unlink(file.filepath),
          fsPromise.unlink(newPath)
        ])
        return {
          // url: isProduction
          //   ? `${process.env.HOST}/static/image/${newFullFileName}`
          //   : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}`,
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename } = files[0]
    return {
      url: isProduction
        ? `${process.env.HOST}/static/video/${newFilename}`
        : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
      type: MediaType.Video
    }
  }
}

const mediasService = new MediasService()

export default mediasService
