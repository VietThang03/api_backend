import { Request, Response } from "express";

export const getConverstationController = (req: Request, res: Response) => {
  return res.send({
    message: 'get converstations'
  })
}