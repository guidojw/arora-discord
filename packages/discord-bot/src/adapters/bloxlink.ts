import axios, { type AxiosPromise, type Method } from 'axios'

export default async function bloxlinkAdapter (method: Method, pathname: string): Promise<AxiosPromise> {
  return await axios({
    url: 'https://api.blox.link/v1/' + pathname,
    method
  })
}
