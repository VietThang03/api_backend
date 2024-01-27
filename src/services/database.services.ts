import { Collection, Db, MongoClient } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follow.schema'
import Status from '~/models/schemas/Status.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'
import Comment from '~/models/schemas/Comments.schema'
import Vacation from '~/models/schemas/Vacation.schema'
import Album from '~/models/schemas/Album.shema'
import Converstation from '~/models/schemas/Conversations.schema'

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@travel.krviq3o.mongodb.net/?retryWrites=true&w=majority`

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

  get comments(): Collection<Comment>{
    return this.db.collection(process.env.DB_COLLECTIONS_COMMENTS as string)
  }

  get vacations(): Collection<Vacation>{
    return this.db.collection(process.env.DB_COLLECTIONS_VACATIONS as string)
  }

  get albums(): Collection<Album>{
    return this.db.collection(process.env.DB_COLLECTIONS_ALBUMS as string)
  }

  get conversations(): Collection<Converstation>{
    return this.db.collection(process.env.DB_COLLECTIONS_CONVERSTATIONS as string)
  }

  async indexPosts() {
    const exists = await this.posts.indexExists(['content_text'])
    if (!exists) {
      this.posts.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }

  async indexVacations() {
    const exists = await this.vacations.indexExists(['vacation_name_text'])
    if (!exists) {
      this.vacations.createIndex({ vacation_name: 'text'}, { default_language: 'none' })
    }
  }

}

// Tao object tu class database
const database = new DatabaseService()

export default  database