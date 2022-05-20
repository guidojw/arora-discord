import axios, { type AxiosPromise, type AxiosRequestConfig, type Method } from 'axios'
import applicationConfig from '../configs/application'

export default async function applicationAdapter (method: Method, pathname: string, data?: any): Promise<AxiosPromise> {
  if (applicationConfig.apiEnabled === true) {
    const options: AxiosRequestConfig = {
      url: `${process.env.HOST ?? '127.0.0.1'}/${pathname}`,
      method,
      data
    }
    if (typeof process.env.TOKEN !== 'undefined') {
      options.headers = { Authorization: `Bearer ${process.env.TOKEN}` }
    }
    return await axios(options)
  } else {
    throw new Error('This bot has no API enabled.')
  }
}
