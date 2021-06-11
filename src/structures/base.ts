import Client from '../client/client'

export default class BaseStructure {
  public readonly client: Client

  public constructor (client: Client) {
    this.client = client
  }

  public setup (data: any): any {
    return data
  }
}
