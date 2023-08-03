import { ObjectId, WithId } from "mongodb";
import database from "./database.services";
import Bookmark from "~/models/schemas/Bookmark.schema";

class BookmarkServices{
  async bookmarksStatus(user_id: string, status_id: string){
    const result = await database.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        status_id: new ObjectId(status_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          status_id: new ObjectId(status_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value as WithId<Bookmark>
  }
  
  async unBookmarksStatus(user_id: string, status_id: string){
   const result =  await database.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      status_id: new ObjectId(status_id)
    })
    return result
  }

}

const bookmarkServices = new BookmarkServices();

export default bookmarkServices;