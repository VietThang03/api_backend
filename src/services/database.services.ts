import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follow.schema'
import Status from '~/models/schemas/Status.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@travel.krviq3o.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // await client.connect();
      await this.db.command({ ping: 1 })
      console.log('Database connect successfully!!!')
    } catch {
      throw Error("Can't connected to the database")
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_COLLECTIONS_USERS as string)
  }

  get refreshToken(): Collection<RefreshToken>{
    return this.db.collection(process.env.DB_COLLECTIONS_REFRESH_TOKEN as string)
  }

  get followers(): Collection<Follower>{
    return this.db.collection(process.env.DB_COLLECTIONS_FOLLOWER as string)
  }

  get posts(): Collection<Status>{
    return this.db.collection(process.env.DB_COLLECTIONS_POSTS as string)
  }

  get hastags(): Collection<Hashtag>{
    return this.db.collection(process.env.DB_COLLECTIONS_HASHTAGS as string)
  }

  get bookmarks(): Collection<Bookmark>{
    return this.db.collection(process.env.DB_COLLECTIONS_BOOKMARKS as string)
  }

  get likes(): Collection<Like>{
    return this.db.collection(process.env.DB_COLLECTIONS_LIKES as string)
  }

}

// Tao object tu class database
const database = new DatabaseService()

export default  database