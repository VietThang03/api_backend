import { createHash } from 'crypto'
import 'dotenv/config'
import { envConfig } from '~/contants/config'


export function sha256(content: string){
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string){
  return sha256(password + envConfig.passwordSecret)
}