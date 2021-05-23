import axios, { Method } from 'axios'

export default async function bloxlinkAdapter (method: Method, pathname: string): Promise<any> {
  return await axios({
    url: 'https://api.blox.link/v1/' + pathname,
    method
  })
}
