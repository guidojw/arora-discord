import type Client from './client'

export default interface BaseHandler {
  handle: (client: Client, ...args: any[]) => Promise<void>
}
