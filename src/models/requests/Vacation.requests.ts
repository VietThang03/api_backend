import { StatusAudience, VacationMentions } from "~/contants/enum"

export interface VacationReqBody{
  vacation_name: string
  vacation_description: string
  audience: VacationMentions
  mentions: string[]
  vacation_avatar?: string
  vacation_cover?: string
  vacation_intro: string
}