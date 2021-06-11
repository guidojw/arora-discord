import axios, { AxiosPromise, Method } from 'axios'

export default async function roVerAdapter (method: Method, pathname: string): Promise<AxiosPromise> {
  return await axios({
    url: 'https://verify.eryn.io/api/' + pathname,
    method
  })
}
