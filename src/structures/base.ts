import { CommandoClient } from 'discord.js-commando'

export default class BaseStructure {
  readonly client: CommandoClient

  constructor (client: CommandoClient) {
    this.client = client
  }

  setup (data: any): any {
    return data
  }
}
