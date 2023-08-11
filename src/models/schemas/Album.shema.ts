import { ObjectId } from "mongodb";
import { AlbumAudience } from "~/contants/enum";
import { Media } from "../Media/Media";

export interface AlbumType{
  _id?: ObjectId
  album_name: string
  album_description: string
  user_id: ObjectId
  audience: AlbumAudience
  medias: Media[]
  created_at?: Date
  updated_at?: Date
}

export default class Album {
  _id?: ObjectId
  album_name: string
  album_description: string
  user_id: ObjectId
  audience: AlbumAudience
  medias: Media[]
  created_at: Date
  updated_at: Date
  constructor({
    _id,
    album_name,
    album_description,
    user_id,
    audience,
    medias,
    created_at,
    updated_at
  }: AlbumType) {
    const date = new Date()
    this._id = _id
    this.album_name = album_name
    this.album_description = album_description
    this.user_id = user_id
    this.audience = audience
    this.medias = medias
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}