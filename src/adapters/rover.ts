import axios, { type AxiosPromise, type AxiosRequestConfig, type Method } from 'axios'

export default async function roVerAdapter (method: Method, pathname: string): Promise<AxiosPromise> {
  const options: AxiosRequestConfig = {
    url: 'https://registry.rover.link/api/' + pathname,
    method
  }
  if (typeof process.env.ROVER_TOKEN !== 'undefined') {
    options.headers = { Authorization: `Bearer ${process.env.ROVER_TOKEN}` }
  }
  return await axios(options)
}
