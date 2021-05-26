import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import Tag from './tag'

export default class TagName implements BaseStructure {
  readonly client: CommandoClient
  readonly tag: Tag
  name!: string

  constructor (client: CommandoClient, data: any, tag: Tag) {
    this.client = client
    this.tag = tag

    this.setup(data)
  }

  setup (data: any): void {
    this.name = data.name
  }

  delete (): void {
    return this.tag.names.delete(this)
  }
}
