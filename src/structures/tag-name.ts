import BaseStructure from './base'
import type { Client } from 'discord.js'
import type Tag from './tag'
import type { TagName as TagNameEntity } from '../entities'

export default class TagName extends BaseStructure {
  public readonly tag: Tag
  public name!: string

  public constructor (client: Client, data: TagNameEntity, tag: Tag) {
    super(client)
    this.tag = tag

    this.setup(data)
  }

  public setup (data: TagNameEntity): void {
    this.name = data.name
  }

  public async delete (): Promise<void> {
    return await this.tag.names.delete(this)
  }
}
