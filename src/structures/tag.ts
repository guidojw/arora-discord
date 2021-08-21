import type { Client, Guild, MessageEmbedOptions } from 'discord.js'
import BaseStructure from './base'
import { MessageEmbed } from 'discord.js'
import type { Tag as TagEntity } from '../entities'
import TagTagNameManager from '../managers/tag-tag-name'

export interface TagUpdateOptions { content?: string | MessageEmbedOptions }

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

  public async update (data: TagUpdateOptions): Promise<Tag> {
    return await this.guild.tags.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.tags.delete(this)
  }

  public override toString (): string {
    return this.names.cache.first()?.name ?? 'unknown'
  }
}