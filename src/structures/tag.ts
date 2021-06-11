import { Guild, MessageEmbed } from 'discord.js'
import BaseStructure from './base'
import Client from '../client/client'
import TagTagNameManager from '../managers/tag-tag-name'

export default class Tag extends BaseStructure {
  public readonly guild: Guild
  public readonly names: TagTagNameManager
  public id!: string

  private _content!: string

  public constructor (client: Client, data: any, guild: Guild) {
    super(client)

    this.guild = guild
    this.names = new TagTagNameManager(this)

    this.setup(data)
  }

  public setup (data: any): void {
    this.id = data.id
    this._content = data.content

    if (typeof data.names !== 'undefined') {
      for (const rawTagName of data.names) {
        this.names.add(rawTagName)
      }
    }
  }

  public get content (): MessageEmbed | string {
    try {
      return new MessageEmbed(JSON.parse(this._content))
    } catch (err) {
      return this._content
    }
  }

  public update (data: any): this {
    return this.guild.tags.update(this, data)
  }

  public delete (): void {
    return this.guild.tags.delete(this)
  }
}
