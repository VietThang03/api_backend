import { StatusRequestBody } from '~/models/requests/Status.requests'
import database from './database.services'
import Status from '~/models/schemas/Status.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

class StatusServices {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
        return database.hastags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({
              name: hashtag
            })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    // Can mang tra ve cac ObjectId de dua vao hashtag[]
    return hashtagDocuments.map((hashtag) => (hashtag.value as WithId<Hashtag>)._id)
  }

  async createStatus(user_id: string, body: StatusRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const result = await database.posts.insertOne(
      new Status({
        user_id: new ObjectId(user_id),
        audience: body.audience,
        content: body.content,
        mentions: body.mentions,
        medias: body.medias,
        type: body.type,
        parent_id: body.parent_id,
        hashtags
      })
    )
    const status = await database.posts.findOne({ _id: result.insertedId })
    return status
  }
  
  async getStatus(status_id: string) {
    const status = await database.posts.findOne({
      _id: new ObjectId(status_id)
    })
    return status
  }

}

const statusServices = new StatusServices()

export default statusServices
