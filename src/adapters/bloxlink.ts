import axios, { type AxiosPromise, type AxiosRequestConfig, type Method } from 'axios'

export default async function bloxlinkAdapter (method: Method, pathname: string): Promise<AxiosPromise> {
  const options: AxiosRequestConfig = {
    url: 'https://v3.blox.link/developer/discord/' + pathname,
    method
  }
  if (typeof process.env.BLOXLINK_TOKEN !== 'undefined') {
    options.headers = { 'api-key': process.env.BLOXLINK_TOKEN }
  }
  return await axios(options)
}
