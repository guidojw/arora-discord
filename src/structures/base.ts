import type Client from '../client/client'

export default abstract class BaseStructure {
  public readonly client: Client

  public constructor (client: Client) {
    this.client = client
  }

  public abstract setup (data: any): void
}
