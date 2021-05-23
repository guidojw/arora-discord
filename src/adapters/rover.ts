import axios, { Method } from 'axios'

export default async function roVerAdapter (method: Method, pathname: string): Promise<any> {
  return await axios({
    url: 'https://verify.eryn.io/api/' + pathname,
    method
  })
}
