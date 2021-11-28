import type { Tag as TagEntity, TagName as TagNameEntity } from '../entities'
import { BaseManager as DiscordBaseManager, type Guild } from 'discord.js'
import type { CommandoClient } from 'discord.js-commando'
import { Repository } from 'typeorm'
import type { Tag } from '../structures'
import TagName from '../structures/tag-name'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type TagNameResolvable = TagName | string

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class TagTagNameManager extends DiscordBaseManager<string, TagName, TagNameResolvable> {
  @lazyInject(TYPES.TagRepository)
  private readonly tagRepository!: Repository<TagEntity>

  @lazyInject(TYPES.TagNameRepository)
  private readonly tagNameRepository!: Repository<TagNameEntity>

  public readonly tag: Tag
  public readonly guild: Guild

  public constructor (tag: Tag, iterable?: Iterable<TagNameEntity>) {
    // @ts-expect-error
    super(tag.guild.client, iterable, TagName)

    this.tag = tag
    this.guild = tag.guild
  }

  public override add (data: TagNameEntity, cache = true): TagName {
    return super.add(data, cache, { id: data.name, extras: [this.tag] })
  }

  public async create (name: string): Promise<TagName> {
    name = name.toLowerCase()
    if (this.guild.tags.resolve(name) !== null) {
      throw new Error('A tag with that name already exists.')
    }
    if (name === 'all' || (this.client as CommandoClient).registry.commands.some(command => command.name === name ||
        command.aliases.includes(name))) {
      throw new Error('Not allowed, name is reserved.')
    }

    const tagNameData = await this.tagNameRepository.save(this.tagNameRepository.create({ name, tagId: this.tag.id }))
    const tagData = await this.tagRepository.findOne(this.tag.id, { relations: ['names'] }) as TagEntity
    if (typeof tagData.names === 'undefined') {
      tagData.names = []
    }
    tagData.names.push(tagNameData)
    await this.tagRepository.save(tagData)

    return this.add(tagNameData)
  }

  public async delete (tagNameResolvable: TagNameResolvable): Promise<void> {
    const id = this.resolveID(tagNameResolvable)
    if (id === null) {
      throw new Error('Invalid name.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Name not found.')
    }
    if (this.cache.size - 1 === 0) {
      throw new Error('Can\'t delete name, the tag would have 0 names after.')
    }

    await this.tagNameRepository.delete({ name: id, tagId: this.tag.id })
    this.cache.delete(id)
  }

  public override resolve (tagNameResolvable: TagNameResolvable): TagName | null {
    if (typeof tagNameResolvable === 'string') {
      tagNameResolvable = tagNameResolvable.toLowerCase()
      return this.cache.find(otherTagName => otherTagName.name.toLowerCase() === tagNameResolvable) ?? null
    }
    return super.resolve(tagNameResolvable)
  }

  public override resolveID (tagNameResolvable: TagNameResolvable): string | null {
    if (tagNameResolvable instanceof this.holds) {
      return tagNameResolvable.name
    }
    if (typeof tagNameResolvable === 'string') {
      tagNameResolvable = tagNameResolvable.toLowerCase()
      return this.cache.find(otherTagName => otherTagName.name.toLowerCase() === tagNameResolvable)?.name ??
        tagNameResolvable
    }
    return null
  }
}
