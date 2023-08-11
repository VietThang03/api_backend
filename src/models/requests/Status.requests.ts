import { StatusAudience, StatusTypeEnum } from "~/contants/enum"
import { Media } from "../Media/Media"
import { ObjectId } from "mongodb"

export interface StatusRequestBody{
  audience: StatusAudience
  type: StatusTypeEnum
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
  // vacation_id?: ObjectId | ''
}
export interface Pagination {
  limit: number
  page: number
}

export interface StatusVacationRequest {
  audience: StatusAudience
  type: StatusTypeEnum
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
  vacation_id: ObjectId
}