import BaseStructure from './base'
import type Client from '../client/client'
import type { Guild } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { Tag as TagEntity } from '../entities'
import TagTagNameManager from '../managers/tag-tag-name'

export default class Tag extends BaseStructure {
  public readonly guild: Guild
  public readonly names: TagTagNameManager
  public id!: number

  private _content!: string

  public constructor (client: Client, data: TagEntity, guild: Guild) {
    super(client)

    this.guild = guild
    this.names = new TagTagNameManager(this)

    this.setup(data)
  }

  public setup (data: TagEntity): void {
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

  public async update (data: Partial<TagEntity>): Promise<this> {
    return await this.guild.tags.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.tags.delete(this)
  }
}
