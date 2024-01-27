import { Request } from 'express'
import { File } from 'formidable'
import path from 'path'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_SINGLE_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/contants/dir'

export const initFolderPath = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR, UPLOAD_SINGLE_IMAGE_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    // khi upload file se vao thu muc uploads
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    // so luong file dc upload
    maxFiles: 100,
    // cho phep thay duoi mo rong cua file, vd: png, jpg, pdf,...
    keepExtensions: true,
    // kich thuoc toi da
    maxFileSize: 100 * 1024 * 1024, //100mb
    maxTotalFileSize: 100 * 1024 * 1024 * 100,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.image as File[])
    })
  })
}

export const handleUploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    // khi upload file se vao thu muc uploads
    uploadDir: UPLOAD_SINGLE_IMAGE_TEMP_DIR,
    // so luong file dc upload
    maxFiles: 1,
    // cho phep thay duoi mo rong cua file, vd: png, jpg, pdf,...
    keepExtensions: true,
    // kich thuoc toi da
    maxFileSize: 10 * 1024 * 1024, //10mb
    maxTotalFileSize: 10 *  1024 * 1024 * 1,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve((files.image as File[])[0])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    // khi upload file se vao thu muc uploads
    uploadDir: UPLOAD_VIDEO_DIR,
    // so luong file dc upload
    maxFiles: 5,
    // kich thuoc toi da
    maxFileSize: 100 * 1024 * 1024, //100mb
    // maxTotalFileSize: 100 * 1024 * 1024 * 100,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + '.' + ext)
        video.newFilename = video.newFilename + '.' + ext
      })
      resolve(files.video as File[])
    })
  })
}

export const getNameFormFullName = (fullname: string) => {
  const namearr = fullname.split('.')
  // loai bo phan tu cuoi cung
  namearr.pop()
  return namearr.join('')
}

export const getExtension = (fullname: string) => {
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}
