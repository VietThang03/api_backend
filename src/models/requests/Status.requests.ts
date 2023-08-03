import { StatusAudience, StatusTypeEnum } from "~/contants/enum"
import { Media } from "../Media/Media"

export interface StatusRequestBody{
  audience: StatusAudience
  type: StatusTypeEnum
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}