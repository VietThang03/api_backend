import { ObjectId } from 'mongodb'
import { Media } from '../Media/Media'
import { StatusAudience, StatusTypeEnum } from '~/contants/enum'

interface StatusType {
  _id?: ObjectId
  user_id: ObjectId
  audience: StatusAudience
  type: StatusTypeEnum
  content: string
  parent_id: null | string
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  user_views?: number
  created_at?: Date
  updated_at?: Date
  vacation_id?: ObjectId | ''
}

export default class Status {
  _id?: ObjectId
  user_id: ObjectId
  audience: StatusAudience
  type: StatusTypeEnum
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  user_views: number
  created_at: Date
  updated_at: Date
  vacation_id?: ObjectId | ''
  constructor({
    _id,
    user_id,
    audience,
    type,
    content,
    hashtags,
    medias,
    mentions,
    created_at,
    updated_at,
    user_views,
    parent_id,
    vacation_id
  }: StatusType) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id ? new ObjectId(parent_id) : null
    this.hashtags = hashtags
    this.mentions = mentions.map((item) => new ObjectId(item))
    this.medias = medias
    this.user_views = user_views || 0
    this.created_at = created_at || date
    this.updated_at = updated_at || date
    this.vacation_id = vacation_id ? new ObjectId(vacation_id) : ''
  }
}
