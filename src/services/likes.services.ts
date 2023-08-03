import { ObjectId, WithId } from "mongodb";
import database from "./database.services";
import Like from "~/models/schemas/Like.schema";

class LikeServices{
  async likesStatus(user_id: string, status_id: string){
    const result = await database.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        status_id: new ObjectId(status_id)
      },
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          status_id: new ObjectId(status_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value as WithId<Like>
  }
  async unLikesStatus(user_id: string, status_id: string){
    const result =  await database.likes.findOneAndDelete({
       user_id: new ObjectId(user_id),
       status_id: new ObjectId(status_id)
     })
     return result
   }
}

const likeServices = new LikeServices();

export default likeServices;