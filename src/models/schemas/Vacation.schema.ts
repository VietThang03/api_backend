import { ObjectId } from 'mongodb'
import { StatusAudience, VacationMentions } from '~/contants/enum'

interface VacationType {
  _id?: ObjectId
  vacation_name: string
  vacation_description: string
  user_id: ObjectId
  created_at?: Date
  updated_at?: Date
  vacation_posts?: ObjectId[]
  vacation_avatar?: string
  vacation_cover?: string
  mentions: string[]
  audience: VacationMentions
}

export default class Vacation {
  _id?: ObjectId
  vacation_name: string
  vacation_description: string
  user_id: ObjectId
  created_at: Date
  updated_at: Date
  vacation_posts: ObjectId[]
  vacation_avatar: string
  vacation_cover: string
  mentions: ObjectId[]
  audience: VacationMentions
  constructor({
    _id,
    vacation_name,
    vacation_description,
    user_id,
    vacation_posts,
    mentions,
    created_at,
    updated_at,
    vacation_avatar,
    vacation_cover,
    audience
  }: VacationType) {
    const date = new Date()
    this._id = _id
    this.vacation_name = vacation_name
    this.vacation_description = vacation_description
    this.user_id = user_id
    this.vacation_posts = vacation_posts || []
    this.mentions = mentions.map((item) => new ObjectId(item))
    this.created_at = created_at || date
    this.updated_at = updated_at || date
    this.vacation_avatar = vacation_avatar || ''
    this.vacation_cover = vacation_cover || ''
    this.audience = audience 
  }
}
