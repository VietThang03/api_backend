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

  async getCommentsStatus(status_id: string) {
    const result = await database.comments
      .find(
        {
          status_id: new ObjectId(status_id)
        },
        {
          projection: {
            user_id: 1,
            comment: 1
          }
        }
      )
      .toArray()
    return result
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
