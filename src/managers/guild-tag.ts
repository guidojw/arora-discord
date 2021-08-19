import type { Guild, MessageEmbedOptions } from 'discord.js'
import { inject, injectable } from 'inversify'
import BaseManager from './base'
import type { CommandoClient } from 'discord.js-commando'
import { MessageEmbed } from 'discord.js'
import type { Repository } from 'typeorm'
import { Tag } from '../structures'
import type { Tag as TagEntity } from '../entities'
import type { TagNameResolvable } from './tag-tag-name'
import { constants } from '../util'
import { discordService } from '../services'

export type TagResolvable = TagNameResolvable | Tag | number

const { TYPES } = constants

@injectable()
export default class GuildTagManager extends BaseManager<Tag, TagResolvable> {
  @inject(TYPES.TagRepository) private readonly tagRepository!: Repository<TagEntity>

  public guild: Guild

  public constructor (guild: Guild, iterable?: Iterable<TagEntity>) {
    // @ts-expect-error
    super(guild.client, iterable, Tag)

    this.guild = guild
  }

  public override add (data: TagEntity, cache = true): Tag {
    return super.add(data, cache, { id: data.id, extras: [this.guild] })
  }

  public async create (name: string, content: string | MessageEmbedOptions): Promise<Tag> {
    name = name.toLowerCase()
    if (this.resolve(name) !== null) {
      throw new Error('A tag with that name already exists.')
    }
    const first = name.split(/ +/)[0]
    if (name === 'all' ||
      (this.client as CommandoClient).registry.commands.some(command => command.name === first ||
        command.aliases.includes(first))) {
      throw new Error('Not allowed, name is reserved.')
    }
    if (typeof content !== 'string') {
      const embed = new MessageEmbed(content)
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        throw new Error(valid)
      }
      content = JSON.stringify(embed.toJSON())
    } else {
      // Once a user fetches a tag, the bot replies to them with the tag content.
      // Tagging a user takes up 23 characters: 21 for tag format (<@snowflake>) + 2 for ", ".
      if (content.length + 23 > 2000) {
        throw new Error('Tag is too long.')
      }
    }

    const newData = await this.tagRepository.save(this.tagRepository.create({
      guildId: this.guild.id,
      content,
      names: [{ name }]
    }))

    return this.add(newData)
  }

  public async delete (tag: TagResolvable): Promise<void> {
    const id = this.resolveID(tag)
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
    data: { content?: string | MessageEmbedOptions }
  ): Promise<Tag> {
    const id = this.resolveID(tag)
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
      id,
      ...changes
    }))

    const _tag = this.cache.get(id)
    _tag?.setup(newData)
    return _tag ?? this.add(newData, false)
  }

  public override resolve (tag: TagResolvable): Tag | null {
    if (typeof tag === 'string') {
      return this.cache.find(otherTag => otherTag.names.resolve(tag) !== null) ?? null
    }
    return super.resolve(tag)
  }

  public override resolveID (tag: TagResolvable): number | null {
    if (typeof tag === 'string') {
      return this.cache.find(otherTag => otherTag.names.resolve(tag) !== null)?.id ?? null
    }
    return super.resolveID(tag)
  }
}
