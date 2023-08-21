import { StatusRequestBody } from '~/models/requests/Status.requests'
import database from './database.services'
import Status from '~/models/schemas/Status.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { ErrorWithStatus } from '~/models/Errors'
import USERS_MESSAGE from '~/contants/messages'
import HTTP_STATUS from '~/contants/httpStatus'
import { Request } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'

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
        ...body,
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

  async getStatusUser({
    user_id,
    user_login,
    limit,
    page
  }: {
    user_id: string
    user_login: string
    limit: number
    page: number
  }) {
    // const result = await database.posts.find({user_id: new ObjectId(user_id)}).toArray()

    if (user_login !== user_id) {
      const result = await database.posts
        .aggregate<Status>([
          {
            $match: {
              user_id: new ObjectId(user_id),
              audience: 0
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
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
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    email: '$$mention.email',
                    username: '$$mention.username'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'status_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'status_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'status_id',
              as: 'comments'
            }
          },
          {
            $addFields: {
              bookmark: {
                $size: '$bookmarks'
              },
              like: {
                $size: '$likes'
              },
              comment: {
                $size: '$comments'
              }
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
        user_id: new ObjectId(user_id),
        audience: 0
      })
      return {
        result,
        total
      } as any
    }

    if (user_login === user_id) {
      const result = await database.posts
        .aggregate<Status>([
          {
            $match: {
              user_id: new ObjectId(user_id)
            }
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
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
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    email: '$$mention.email',
                    username: '$$mention.username'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'status_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'status_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'status_id',
              as: 'comments'
            }
          },
          {
            $addFields: {
              bookmark: {
                $size: '$bookmarks'
              },
              like: {
                $size: '$likes'
              },
              comment: {
                $size: '$comments'
              }
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
        user_id: new ObjectId(user_id)
      })
      return {
        result,
        total
      } as any
    }
  }

  async editStatus(status_id: string, payload: StatusRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(payload.hashtags)
    const parent_id = payload.parent_id ? new ObjectId(payload.parent_id) : null
    const mentions = payload.mentions.map((item) => new ObjectId(item))
    const result = await database.posts.findOneAndUpdate(
      {
        _id: new ObjectId(status_id)
      },
      {
        $set: {
          content: payload.content,
          type: payload.type,
          medias: payload.medias,
          mentions,
          hashtags,
          parent_id,
          audience: payload.audience
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return result.value
  }

  async deleteStatus(status_id: string) {
    const result = await database.posts.findOneAndDelete({
      _id: new ObjectId(status_id)
    })
    return result.value as WithId<Status>
  }

  async increaseView(status_id: string) {
    const result = await database.posts.findOneAndUpdate(
      {
        _id: new ObjectId(status_id)
      },
      {
        $inc: {
          user_views: 1
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result.value as WithId<{
      user_views: number
      updated_at: Date
    }>
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
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
    // Mong muốn newfees sẽ lấy luôn cả tweet của mình
    ids.push(user_id_obj)
    const [status, total] = await Promise.all([
      database.posts
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
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                }
              ]
            }
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
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
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    email: '$$mention.email',
                    username: '$$mention.username'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'status_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'status_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              foreignField: 'status_id',
              as: 'comments'
            }
          },
          {
            $addFields: {
              bookmark: {
                $size: '$bookmarks'
              },
              like: {
                $size: '$likes'
              },
              comment: {
                $size: '$comments'
              }
            }
          },
          {
            $project: {
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                verify: 0,
                date_of_birth: 0,
                created_at: 0,
                updated_at: 0
              }
            }
          }
        ])
        .toArray(),
      database.posts
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
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    return {
      status,
      total: total[0]?.total || 0
    }
  }
}

const statusServices = new StatusServices()

export default statusServices
