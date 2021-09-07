import type { AxiosPromise, Method } from 'axios'
import axios from 'axios'

export default async function roVerAdapter (method: Method, pathname: string): Promise<AxiosPromise> {
  return await axios({
    url: 'https://rover.link/api/' + pathname,
    method
  })
}
