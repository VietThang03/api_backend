import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'
import { createServer } from "http";
import { Server } from "socket.io";
import cors, { CorsOptions } from 'cors'
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
import commentsRouter from './routers/comments.routes'
import vacationRouters from './routers/vacations.routes'
import searchRouters from './routers/search.routes'
import albumRouters from './routers/albums.routers'
import './utils/s3'
import Converstation from './models/schemas/Conversations.schema';
import { envConfig, isProduction } from './contants/config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

initFolderPath()

const app = express()

//trong 15p goi dc toi ta 100 request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
})
app.use(limiter)

const port = envConfig.port

database.connect().then(() => {
  database.indexPosts()
  database.indexVacations()
})
app.use(helmet())
const corsOptions: CorsOptions ={
  origin: isProduction ? envConfig.clientUrl : '*', // cho phep tat ca cac domain deu co the truy cap
}
app.use(cors(corsOptions))

app.use(express.json())

app.use('/users', userRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/posts', statusRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/comments', commentsRouter)
app.use('/vacations', vacationRouters)
app.use('/search', searchRouters)
app.use('/albums', albumRouters)
app.use('/static/video',express.static(path.resolve(UPLOAD_VIDEO_DIR)))
app.use(defaultErrorHandler)


app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
})