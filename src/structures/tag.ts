import { Guild, MessageEmbed } from 'discord.js'
import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import TagTagNameManager from '../managers/tag-tag-name'

export default class Tag implements BaseStructure {
  readonly client: CommandoClient
  readonly guild: Guild
  readonly names: TagTagNameManager
  id!: string
  _content!: string

  constructor (client: CommandoClient, data: any, guild: Guild) {
    this.client = client
    this.guild = guild
    this.names = new TagTagNameManager(this)

    this.setup(data)
  }

  setup (data: any): void {
    this.id = data.id
    this._content = data.content

    if (typeof data.names !== 'undefined') {
      for (const rawTagName of data.names) {
        this.names.add(rawTagName)
      }
    }
  }

  get content (): MessageEmbed | string {
    try {
      return new MessageEmbed(JSON.parse(this._content))
    } catch (err) {
      return this._content
    }
  }

  update (data: any): this {
    return this.guild.tags.update(this, data)
  }

  delete (): void {
    return this.guild.tags.delete(this)
  }
}
