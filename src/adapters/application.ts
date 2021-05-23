import axios, { Method } from 'axios'
import applicationConfig from '../configs/application'

export default async function applicationAdapter (method: Method, pathname: string, data?: any): Promise<any> {
  if (applicationConfig.apiEnabled === true) {
    return await axios({
      url: `${process.env.HOST ?? '127.0.0.1'}/${pathname}`,
      method,
      data,
      headers: {
        Authorization: typeof process.env.TOKEN !== 'undefined' ? `Bearer ${process.env.TOKEN}` : undefined
      }
    })
  } else {
    throw new Error('This bot has no API enabled.')
  }
}
