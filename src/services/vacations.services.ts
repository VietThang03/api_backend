import Vacation from '~/models/schemas/Vacation.schema'
import database from './database.services'
import { VacationReqBody } from '~/models/requests/Vacation.requests'
import { ObjectId, WithId } from 'mongodb'
import { StatusVacationRequest } from '~/models/requests/Status.requests'
import Status from '~/models/schemas/Status.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'

class VacationServices {
  async createVacation(user_id: string, payload: VacationReqBody) {
    const vacation = await database.vacations.insertOne(
      new Vacation({
        ...payload,
        vacation_name: payload.vacation_name,
        vacation_description: payload.vacation_description,
        user_id: new ObjectId(user_id),
        audience: payload.audience,
        mentions: payload.mentions,
        vacation_intro: payload.vacation_intro
      })
    )

    const result = await database.vacations.findOne({
      _id: new ObjectId(vacation.insertedId)
    })
    return result
  }

  async editVacation(vacation_id: string, payload: VacationReqBody) {
    const mentions = payload.mentions.map((item) => new ObjectId(item))
    const result = await database.vacations.findOneAndUpdate(
      {
        _id: new ObjectId(vacation_id)
      },
      {
        $set: {
          vacation_name: payload.vacation_name,
          vacation_description: payload.vacation_description,
          audience: payload.audience,
          mentions,
          vacation_intro: payload.vacation_intro
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    )

    return result.value
  }

  async deleteVacation(vacation_id: string) {
    const result = await database.vacations.findOneAndDelete({
      _id: new ObjectId(vacation_id)
    })

    return result.value
  }

  async getDetailVacation(vacation_id: string) {
    const result = await database.vacations.findOne({
      _id: new ObjectId(vacation_id)
    })

    return result
  }

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

  async statusVacation(user_id: string, payload: StatusVacationRequest) {
    const hashtags = await this.checkAndCreateHashtags(payload.hashtags)
    const status = await database.posts.insertOne(
      new Status({
        user_id: new ObjectId(user_id),
        audience: payload.audience,
        content: payload.content,
        mentions: payload.mentions,
        medias: payload.medias,
        type: payload.type,
        parent_id: payload.parent_id,
        hashtags,
        vacation_id: new ObjectId(payload.vacation_id)
      })
    )

    await database.vacations.findOneAndUpdate(
      {
        _id: new ObjectId(payload.vacation_id)
      },
      {
        $push: {
          vacation_posts: new ObjectId(status.insertedId)
        }
      }
    )

    return status
  }

  async getVacationUser({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const result = await database.vacations
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(user_id)
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await database.vacations.countDocuments({
      user_id: new ObjectId(user_id)
    })

    return {
      result,
      total
    }
  }

  async getVacationStatus({ vacation_id, limit, page }: { vacation_id: string; limit: number; page: number }) {
    const result = await database.posts
      .aggregate([
        {
          $match: {
            vacation_id: new ObjectId(vacation_id)
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await database.posts.countDocuments({
      vacation_id: new ObjectId(vacation_id)
    })

    return {
      result,
      total
    }
  }

  async getNewFeedsVacation({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_obj = new ObjectId(user_id)
    const followed_user_ids = await database.followers
      .find(
        {
          user_id: user_id_obj
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followed_user_ids.map((item) => item.followed_user_id)
    // Mong muốn newfeeds sẽ lấy luôn cả vacation của mình
    ids.push(user_id_obj)
    const [vacation, total] = await Promise.all([
      database.vacations
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $project: {
              user: {
                password: 0,
                date_of_birth: 0,
                created_at: 0,
                updated_at: 0,
                verify: 0,
                email_verify_token: 0,
                forgot_password_token: 0
              },
              mentions: {
                password: 0,
                date_of_birth: 0,
                created_at: 0,
                updated_at: 0,
                verify: 0,
                email_verify_token: 0,
                forgot_password_token: 0
              }
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $sort: {
              created_at: -1
            }
          }
        ])
        .toArray(),
      database.vacations
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    return {
      vacation,
      total: total[0]?.total || 0
    }
  }

  async getPostsVacation({ vacation_id, limit, page }: { vacation_id: string; limit: number; page: number }) {
    const result = await database.posts
      .aggregate([
        {
          $match: {
            vacation_id: new ObjectId(vacation_id)
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const total = await database.posts.countDocuments({
      vacation_id: new ObjectId(vacation_id)
    })

    return {
      result,
      total
    }
  }

}

const vacationServices = new VacationServices()
export default vacationServices
