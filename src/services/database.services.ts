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
import { envConfig } from '~/contants/config'

const uri = `mongodb+srv://${envConfig.dbUsername}:${envConfig.dbPassword}@travel.krviq3o.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.dbName)
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
    return this.db.collection(envConfig.dbUsersCollection)
  }

  get refreshToken(): Collection<RefreshToken>{
    return this.db.collection(envConfig.dbRefreshTokensCollection)
  }

  get followers(): Collection<Follower>{
    return this.db.collection(envConfig.dbFollowersCollection)
  }

  get posts(): Collection<Status>{
    return this.db.collection(envConfig.dbPostsCollection)
  }

  get hastags(): Collection<Hashtag>{
    return this.db.collection(envConfig.dbHashTagsCollection)
  }

  get bookmarks(): Collection<Bookmark>{
    return this.db.collection(envConfig.dbBookmarksCollection)
  }

  get likes(): Collection<Like>{
    return this.db.collection(envConfig.dbLikesCollection)
  }

  get comments(): Collection<Comment>{
    return this.db.collection(envConfig.dbCommentsCollection)
  }

  get vacations(): Collection<Vacation>{
    return this.db.collection(envConfig.dbVacationsCollection)
  }

  get albums(): Collection<Album>{
    return this.db.collection(envConfig.dbAlbumsCollection)
  }

  get conversations(): Collection<Converstation>{
    return this.db.collection(envConfig.dbCoverstationsCollection)
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