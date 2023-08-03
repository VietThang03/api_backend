import { ObjectId } from 'mongodb'

interface LikeType {
  _id?: ObjectId
  user_id: ObjectId
  status_id: ObjectId
  created_at?: Date
}
export default class Like {
  _id: ObjectId
  user_id: ObjectId
  status_id: ObjectId
  created_at?: Date
  constructor({ _id, user_id, status_id, created_at }: LikeType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.status_id = status_id
    this.created_at = created_at || new Date()
  }
}