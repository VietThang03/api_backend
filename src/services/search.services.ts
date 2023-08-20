import { SearchQuery } from '~/models/requests/Search.request'
import database from './database.services'

class SearchServices {
  async search({ search_query, limit, page }: { limit: number; page: number; search_query: string }) {
    const [users, total, vacations, total_vacation] = await Promise.all([
      database.users
        .aggregate([
          {
            $match: {
              name: {
                $regex: search_query
              }
            }
          },
          {
            $project: {
              password: 0,
              date_of_birth: 0,
              created_at: 0,
              updated_at: 0,
              email_verify_token: 0,
              forgot_password_token: 0
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      database.users
        .aggregate([
          {
            $match: {
              name: {
                $regex: search_query
              }
            }
          },
          {
            $project: {
              password: 0,
              date_of_birth: 0,
              created_at: 0,
              updated_at: 0,
              email_verify_token: 0,
              forgot_password_token: 0
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray(),
      database.vacations
        .aggregate([
          {
            $match: {
              // $text: {
              //   $search: vacation_name
              // },
              vacation_name: {
                $regex: search_query
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
              // $text: {
              //   $search: vacation_name
              //  },
              vacation_name: {
                $regex: search_query
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
      users,
      total: total[0]?.total || 0,
      vacations,
      total_vacation: total_vacation[0]?.total_vacation || 0
    }
  }
}

const searchServices = new SearchServices()
export default searchServices
