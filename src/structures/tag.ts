import BaseStructure from './base'
import type { Client } from 'discord.js'
import type GuildContext from './guild-context'
import { MessageEmbed } from 'discord.js'
import type { Tag as TagEntity } from '../entities'
import TagTagNameManager from '../managers/tag-tag-name'

export interface TagUpdateOptions { content?: string | object }

export default class Tag extends BaseStructure {
  public readonly context: GuildContext
  public readonly names: TagTagNameManager
  public id!: number
  public _content!: string

  public constructor (client: Client<true>, data: TagEntity, context: GuildContext) {
    super(client)

    this.context = context
    this.names = new TagTagNameManager(this)

    this.setup(data)
  }

  public setup (data: TagEntity): void {
    this.id = data.id
    this._content = data.content

    if (typeof data.names !== 'undefined') {
      for (const rawTagName of data.names) {
        this.names._add(rawTagName)
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
    return await this.context.tags.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.context.tags.delete(this)
  }

  public override toString (): string {
    return this.names.cache.first()?.name ?? 'unknown'
  }
}
