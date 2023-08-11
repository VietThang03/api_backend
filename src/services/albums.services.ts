import { AlbumRequestBody } from '~/models/requests/Album.requests'
import database from './database.services'
import Album from '~/models/schemas/Album.shema'
import { ObjectId } from 'mongodb'

class AlbumServices {
  async createAlbum(user_id: string, payload: AlbumRequestBody) {
    const album = await database.albums.insertOne(
      new Album({
        album_name: payload.album_name,
        album_description: payload.album_description,
        user_id: new ObjectId(user_id),
        audience: payload.audience,
        medias: payload.medias
      })
    )

    const result = await database.albums.findOne({ _id: album.insertedId })

    return result
  }

  async getDetailAlbum(album_id: string) {
    const result = await database.albums.findOne({ _id: new ObjectId(album_id) })
    return result
  }

  async updateAlbum(album_id: string, payload: AlbumRequestBody) {
    const result = await database.albums.findOneAndUpdate(
      { _id: new ObjectId(album_id) },
      {
        $set: {
          album_name: payload.album_name,
          album_description: payload.album_description,
          audience: payload.audience,
          medias: payload.medias
        },

        $currentDate: {
          updated_at: true
        }
      },
      { returnDocument: 'after' }
    )

    return result.value
  }

  async deleteAlbum(album_id: string) {
    const result = await database.albums.findOneAndDelete({ _id: new ObjectId(album_id) })
    return result.value
  }

  async getAlbumsUser(user_id: string) {
    const result = await database.albums.find({ user_id: new ObjectId(user_id) }).toArray()
    return result
  }

}

const albumServices = new AlbumServices()

export default albumServices
