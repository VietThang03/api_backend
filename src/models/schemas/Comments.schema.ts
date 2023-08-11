import { ObjectId } from 'mongodb'

interface CommentType {
  _id?: ObjectId
  user_id: ObjectId
  status_id: ObjectId
  comment: string
  created_at?: Date
  updated_at?: Date
}
export default class Comment {
  _id: ObjectId
  user_id: ObjectId
  status_id: ObjectId
  comment: string
  created_at?: Date
  updated_at?: Date
  constructor({ _id, user_id, status_id, created_at,comment, updated_at }: CommentType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.status_id = status_id
    this.created_at = created_at || new Date()
    this.comment = comment
    this.updated_at = updated_at || new Date()
  }
}