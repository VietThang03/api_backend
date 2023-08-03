import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'
import database from './services/database.services'
import userRouter from './routers/user.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routers/medias.routes'
import { initFolderPath } from './utils/file'
import path from 'path'
import staticRouter from './routers/static.routers'
import { UPLOAD_VIDEO_DIR } from './contants/dir'
import statusRouter from './routers/status.routes'
import bookmarksRouter from './routers/bookmarks.routes'
import likesRouter from './routers/like.routes'


initFolderPath()

const app = express()
const port = process.env.PORT
database.connect()

app.use(express.json())

app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/posts', statusRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)

app.use(defaultErrorHandler)
app.use('/static/video',express.static(path.resolve(UPLOAD_VIDEO_DIR)))

app.get('/', (req, res) => {
    console.log('Hello world')
})



app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
})