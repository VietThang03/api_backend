import { SearchQuery } from '~/models/requests/Search.request'
import database from './database.services'

class SearchServices {
  async search({ content, limit, page, vacation_name, people_follow }: { limit: number; page: number; content: string; vacation_name: string; people_follow?  : string }) {
    const [vacations, total_vacation] = await Promise.all([
      // database.posts
      //   .aggregate([
      //     {
      //       $match: {
      //         $text: { 
      //           $search: content
      //          }
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from: 'users',
      //         localField: 'user_id',
      //         foreignField: '_id',
      //         as: 'user'
      //       }
      //     },
      //     {
      //       $unwind: {
      //         path: '$user'
      //       }
      //     },
      //     {
      //       $match: {
      //         $or: [
      //           {
      //             audience: 0
      //           }
      //         ]
      //       }
      //     },
      //     {
      //       $skip: limit * (page - 1)
      //     },
      //     {
      //       $limit: limit
      //     },
      //     {
      //       $lookup: {
      //         from: 'hashtags',
      //         localField: 'hashtags',
      //         foreignField: '_id',
      //         as: 'hashtags'
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from: 'users',
      //         localField: 'mentions',
      //         foreignField: '_id',
      //         as: 'mentions'
      //       }
      //     },
      //     {
      //       $addFields: {
      //         mentions: {
      //           $map: {
      //             input: '$mentions',
      //             as: 'mention',
      //             in: {
      //               _id: '$$mention._id',
      //               name: '$$mention.name',
      //               email: '$$mention.email',
      //               username: '$$mention.username'
      //             }
      //           }
      //         }
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from: 'bookmarks',
      //         localField: '_id',
      //         foreignField: 'status_id',
      //         as: 'bookmarks'
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from: 'likes',
      //         localField: '_id',
      //         foreignField: 'status_id',
      //         as: 'likes'
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from: 'comments',
      //         localField: '_id',
      //         foreignField: 'status_id',
      //         as: 'comments'
      //       }
      //     },
      //     {
      //       $addFields: {
      //         bookmark: {
      //           $size: '$bookmarks'
      //         },
      //         like: {
      //           $size: '$likes'
      //         },
      //         comment: {
      //           $size: '$comments'
      //         }
      //       }
      //     },
      //     {
      //       $project: {
      //         user: {
      //           password: 0,
      //           email_verify_token: 0,
      //           forgot_password_token: 0,
      //           verify: 0,
      //           date_of_birth: 0,
      //           create_at: 0,
      //           update_at: 0
      //         }
      //       }
      //     },
      //     {
      //       $sort: {
      //         created_at: -1
      //       }
      //     }
      //   ])
      //   .toArray(),
      // database.posts
      //   .aggregate([
      //     {
      //       $match: {
      //         $text: { 
      //           $search: content 
      //         }
      //       }
      //     },
      //     {
      //       $lookup: {
      //         from: 'users',
      //         localField: 'user_id',
      //         foreignField: '_id',
      //         as: 'user'
      //       }
      //     },
      //     {
      //       $unwind: {
      //         path: '$user'
      //       }
      //     },
      //     {
      //       $match: {
      //         $or: [
      //           {
      //             audience: 0
      //           }
      //         ]
      //       }
      //     },
      //     {
      //       $count: 'total'
      //     }
      //   ])
      //   .toArray(),
      database.vacations
        .aggregate([
          {
            $match: {
              $text: { 
                $search: vacation_name 
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $project: {
              user: {
                password: 0,
                date_of_birth: 0,
                created_at: 0,
                updated_at: 0,
                verify: 0,
                email_verify_token: 0,
                forgot_password_token: 0
              },
              mentions: {
                password: 0,
                date_of_birth: 0,
                created_at: 0,
                updated_at: 0,
                verify: 0,
                email_verify_token: 0,
                forgot_password_token: 0
              }
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $sort: {
              created_at: -1
            }
          }
        ])
        .toArray(),
      database.vacations
        .aggregate([
          {
            $match: {
              $text: { 
                $search: vacation_name
               }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $count: 'total_vacation'
          }
        ])
        .toArray()
    ])
    return {
      // posts,
      // total: total[0]?.total || 0,
      vacations,
      total_vacation: total_vacation[0]?.total_vacation || 0
    }
  }
}

const searchServices = new SearchServices()
export default searchServices
