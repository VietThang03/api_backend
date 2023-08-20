import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.request'
import searchServices from '~/services/search.services'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchServices.search({
    limit,
    page,
    search_query: req.query.q
  })
  res.send({
    message: 'success',
    total_page: Math.ceil((result.total_vacation + result.total) / limit),
    total_vacations: result.vacations.length,
    total_users: result.users.length,
    page: Number(req.query.page),
    data: {
      vacations: result.vacations,
      users: result.users
    }
  })
}
