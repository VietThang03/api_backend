import { Pagination } from "./Status.requests";

export interface SearchQuery extends Pagination {
  content: string
  vacation_name: string
  people_follow: string
}