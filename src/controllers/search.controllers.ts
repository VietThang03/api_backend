import { Request, Response } from "express";
import {ParamsDictionary} from 'express-serve-static-core'
import { SearchQuery } from "~/models/requests/Search.request";
import searchServices from "~/services/search.services";

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchServices.search({
    limit,
    page,
    content: req.query.content,
    vacation_name: req.query.vacation_name,
    people_follow: req.query.people_follow
  })
  res.send({
    message: 'success',
    result:{
      total_page: Math.ceil(result.total_vacation/limit),
      total: result.vacations.length,
      page: Number(req.query.page),
      // posts: result?.posts,
      vacations: result.vacations
    }
  })
}