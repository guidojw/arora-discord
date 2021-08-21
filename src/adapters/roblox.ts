import type { AxiosPromise, Method } from 'axios'
import axios from 'axios'

export default async function robloxAdapter (
  method: Method,
  api: string,
  pathname: string,
  data?: any
): Promise<AxiosPromise> {
  return await axios({
    url: `https://${api}.roblox.com/${pathname}`,
    method,
    data
  })
}
