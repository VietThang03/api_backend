import { ObjectId, WithId } from 'mongodb'
import database from './database.services'
import Like from '~/models/schemas/Like.schema'

class LikeServices {
  async likesStatus(user_id: string, status_id: string) {
    const result = await database.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        status_id: new ObjectId(status_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          status_id: new ObjectId(status_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value as WithId<Like>
  }
  async unLikesStatus(user_id: string, status_id: string) {
    const result = await database.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      status_id: new ObjectId(status_id)
    })
    return result
  }
  async getLikeStatus({status_id, limit, page}:{status_id: string; limit: number; page: number}) {
    const result = await database.likes.aggregate([
      {
        $match: {
          status_id: new ObjectId(status_id)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_like'
        }
      },
      {
        $unwind: {
          path: '$user_like'
        }
      },
      {
        $project: {
          user_like: {
            password: 0,
            forgot_password_token: 0,
            created_at: 0,
            updated_at: 0,
            verify: 0,
            email_verify_token: 0
          }
        }
      },
      {
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
      }
    ]).toArray()
    const total = await database.likes.countDocuments({
      status_id: new ObjectId(status_id)
    })
    return {
      result,
      total
    }
  }
  async countLikes(status_id: string) {
    const total = await database.likes.countDocuments({
      status_id: new ObjectId(status_id)
    })
    return total
  }
}

const likeServices = new LikeServices()

export default likeServices
