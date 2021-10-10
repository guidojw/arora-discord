import type { GuildContext, Tag } from '../structures'
import type { Tag as TagEntity, TagName as TagNameEntity } from '../entities'
import { CachedManager } from 'discord.js'
import type { Repository } from 'typeorm'
import TagName from '../structures/tag-name'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type TagNameResolvable = TagName | string

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

// @ts-expect-error
export default class TagTagNameManager extends CachedManager<string, TagName, TagNameResolvable> {
  @lazyInject(TYPES.TagRepository)
  private readonly tagRepository!: Repository<TagEntity>

  @lazyInject(TYPES.TagNameRepository)
  private readonly tagNameRepository!: Repository<TagNameEntity>

  public readonly tag: Tag
  public readonly context: GuildContext

  public constructor (tag: Tag) {
    super(tag.client, TagName)

    this.tag = tag
    this.context = tag.context
  }

  public override _add (data: TagNameEntity, cache = true): TagName {
    // @ts-expect-error
    return super._add(data, cache, { id: data.name, extras: [this.tag] })
  }

  public async create (name: string): Promise<TagName> {
    name = name.toLowerCase()
    if (this.context.tags.resolve(name) !== null) {
      throw new Error('A tag with that name already exists.')
    }

    const tagNameData = await this.tagNameRepository.save(this.tagNameRepository.create({ name, tagId: this.tag.id }))
    const tagData = await this.tagRepository.findOne(this.tag.id, { relations: ['names'] }) as TagEntity
    if (typeof tagData.names === 'undefined') {
      tagData.names = []
    }
    tagData.names.push(tagNameData)
    await this.tagRepository.save(tagData)

    return this._add(tagNameData)
  }

  public async delete (tagNameResolvable: TagNameResolvable): Promise<void> {
    const id = this.resolveId(tagNameResolvable)
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

  public override resolve (tagName: TagName): TagName
  public override resolve (tagName: TagNameResolvable): TagName | null
  public override resolve (tagName: TagNameResolvable): TagName | null {
    if (typeof tagName === 'string') {
      tagName = tagName.toLowerCase()
      return this.cache.find(otherTagName => otherTagName.name.toLowerCase() === tagName) ?? null
    }
    return super.resolve(tagName)
  }

  public override resolveId (tagName: string): string
  public override resolveId (tagName: TagNameResolvable): string | null
  public override resolveId (tagName: TagNameResolvable): string | null {
    if (tagName instanceof this.holds) {
      return tagName.name
    }
    if (typeof tagName === 'string') {
      return this.resolve(tagName)?.name ?? tagName
    }
    return null
  }
}
