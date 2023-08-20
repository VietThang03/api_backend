import { CommentReqBody } from '~/models/requests/Comment.request'
import database from './database.services'
import Comment from '~/models/schemas/Comments.schema'
import { ObjectId } from 'mongodb'

class CommentServices {
  async createComment(user_id: string, payload: CommentReqBody) {
    const result = await database.comments.insertOne(
      new Comment({
        user_id: new ObjectId(user_id),
        comment: payload.comment,
        status_id: new ObjectId(payload.status_id)
      })
    )
    return result
  }

  async getCommentsStatus({ status_id, limit, page }: { status_id: string; limit: number; page: number }) {
    const result = await database.comments
      .aggregate([
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
            as: 'user'
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
              verify: 0,
              created_at_at: 0,
              updated_at_at: 0,
              forgot_password_token: 0,
              email_verify_token: 0
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
      .toArray()
    const total = await database.comments.countDocuments({
      status_id: new ObjectId(status_id)
    })
    return {
      total,
      result
    }
  }

  editComment(comment_id: string, comment: string) {
    return database.comments.findOneAndUpdate(
      {
        _id: new ObjectId(comment_id)
      },
      {
        $set: {
          comment
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  deleteComment(comment_id: string) {
    return database.comments.findOneAndDelete({
      _id: new ObjectId(comment_id)
    })
  }
}

const commentServices = new CommentServices()

export default commentServices
