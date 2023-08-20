import { Pagination } from "./Status.requests";

export interface SearchQuery extends Pagination {
  content: string
  q: string
}