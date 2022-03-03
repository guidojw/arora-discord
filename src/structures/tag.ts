import type { BaseManager, TagTagNameManager } from '../managers'
import type { GuildContext, TagName } from '.'
import { inject, injectable } from 'inversify'
import BaseStructure from './base'
import { MessageEmbed } from 'discord.js'
import type { Tag as TagEntity } from '../entities'
import { constants } from '../utils'

const { TYPES } = constants

export interface TagUpdateOptions { content?: string | object }

@injectable()
export default class Tag extends BaseStructure<TagEntity> {
  public context!: GuildContext

  public readonly names: TagTagNameManager

  public id!: number
  public _content!: string

  public constructor (
  @inject(TYPES.ManagerFactory) managerFactory: <
    T extends BaseManager<K, U, unknown>,
    U extends { id: K },
    K extends number | string = number | string
    > (managerName: string) => (...args: T['setOptions'] extends ((...args: infer P) => any) ? P : never[]) => T
  ) {
    super()

    this.names = managerFactory<TagTagNameManager, TagName>('TagTagNameManager')(this)
  }

  public setOptions (data: TagEntity, context: GuildContext): void {
    this.context = context

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
    return await this.context.tags.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.context.tags.delete(this)
  }

  public override toString (): string {
    return this.names.cache.first()?.name ?? 'unknown'
  }
}
