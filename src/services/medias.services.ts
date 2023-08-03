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

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    // trong truong hop upload nhieu file, khong muon doi await tung file => Dung Promise.all
    // map se tra ve 1 array => cung type voi File[] (map trong Promise se tra ve 1 array Promise)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFormFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        // sau khi chuyen doi anh thi dua ve thu muc uploads
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
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
