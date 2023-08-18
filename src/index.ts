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

initFolderPath()

const app = express()
const httpServer = createServer(app);
const port = process.env.PORT

database.connect().then(() => {
  database.indexPosts()
  database.indexVacations()
})

const corsOptions: CorsOptions ={
  origin:'*', // cho phep tat ca cac domain deu co the truy cap
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


const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  const user_id = socket.handshake.auth._id
  const name = socket.handshake.auth.name
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)
  socket.on('notification', (data) => {
    // console.log(data)
    const receiver_socket_id = users[data.to].socket_id
    socket.to(receiver_socket_id).emit('notification user', {
      message: `${name} vua binh luan vao bai viet cua ban`,
      content: data.content,
      from: user_id
    })
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log('user disconnected')
  })
})


httpServer.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
})