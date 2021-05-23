import axios, { Method } from 'axios'

export default async function robloxAdapter (method: Method, api: string, pathname: string, data?: any): Promise<any> {
  return await axios({
    url: `https://${api}.roblox.com/${pathname}`,
    method,
    data
  })
}
