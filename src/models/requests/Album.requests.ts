import { AlbumAudience } from "~/contants/enum"
import { Media } from "../Media/Media"

export interface AlbumRequestBody{
  album_name: string
  album_description: string
  medias: Media[]
  audience: AlbumAudience
}