import { GuildContext, Tag, type TagUpdateOptions } from '../structures'
import BaseManager from './base'
import { MessageEmbed } from 'discord.js'
import type { Repository } from 'typeorm'
import type { Tag as TagEntity } from '../entities'
import type { TagNameResolvable } from './tag-tag-name'
import { constants } from '../utils'
import container from '../configs/container'
import { discordService } from '../services'
import getDecorators from 'inversify-inject-decorators'

export type TagResolvable = TagNameResolvable | Tag | number

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GuildTagManager extends BaseManager<Tag, TagResolvable> {
  @lazyInject(TYPES.TagRepository)
  private readonly tagRepository!: Repository<TagEntity>

  public readonly context: GuildContext

  public constructor (context: GuildContext) {
    super(context.client, Tag)

    this.context = context
  }

  public override _add (data: TagEntity, cache = true): Tag {
    return super._add(data, cache, { id: data.id, extras: [this.context] })
  }

  public async create (name: string, content: string | object): Promise<Tag> {
    name = name.toLowerCase()
    if (this.resolve(name) !== null) {
      throw new Error('A tag with that name already exists.')
    }
    if (typeof content !== 'string') {
      const embed = new MessageEmbed(content)
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        throw new Error(valid)
      }
      content = JSON.stringify(embed.toJSON())
    } else {
      // Once a user fetches a tag, the bot replies to them with the tag
      // content. Tagging a user takes up 23 characters: 21 for tag format
      // (<@snowflake>) + 2 for ", ".
      if (content.length + 23 > 2000) {
        throw new Error('Tag is too long.')
      }
    }

    const newData = await this.tagRepository.save(this.tagRepository.create({
      guildId: this.context.id,
      content,
      names: [{ name }]
    }))

    return this._add(newData)
  }

  public async delete (tag: TagResolvable): Promise<void> {
    const id = this.resolveId(tag)
    if (id === null) {
      throw new Error('Invalid tag.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Tag not found.')
    }

    await this.tagRepository.delete(id)
    this.cache.delete(id)
  }

  public async update (
    tag: TagResolvable,
    data: TagUpdateOptions
  ): Promise<Tag> {
    const id = this.resolveId(tag)
    if (id === null) {
      throw new Error('Invalid tag.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Tag not found.')
    }

    const changes: Partial<TagEntity> = {}
    if (typeof data.content !== 'undefined') {
      if (typeof data.content !== 'string') {
        const embed = new MessageEmbed(data.content)
        const valid = discordService.validateEmbed(embed)
        if (typeof valid === 'string') {
          throw new Error(valid)
        }
        changes.content = JSON.stringify(embed.toJSON())
      } else {
        if (data.content.length + 23 > 2000) {
          throw new Error('Tag is too long.')
        }
        changes.content = data.content
      }
    }

    const newData = await this.tagRepository.save(this.tagRepository.create({
      ...changes,
      id
    }))

    const _tag = this.cache.get(id)
    _tag?.setup(newData)
    return _tag ?? this._add(newData, false)
  }

  public override resolve (tag: Tag): Tag
  public override resolve (tag: TagResolvable): Tag | null
  public override resolve (tag: TagResolvable): Tag | null {
    if (typeof tag === 'string') {
      return this.cache.find(otherTag => otherTag.names.resolve(tag) !== null) ?? null
    }
    return super.resolve(tag)
  }

  public override resolveId (tag: number): number
  public override resolveId (tag: TagResolvable): number | null
  public override resolveId (tag: TagResolvable): number | null {
    if (typeof tag === 'string') {
      return this.resolve(tag)?.id ?? null
    }
    return super.resolveId(tag)
  }
}
