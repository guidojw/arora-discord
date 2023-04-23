import { type GuildContext, type Tag, TagName } from '../structures'
import type { Tag as TagEntity, TagName as TagNameEntity } from '../entities'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

export type TagNameResolvable = TagName | string

@injectable()
export default class TagTagNameManager extends DataManager<string, TagName, TagNameResolvable, TagNameEntity> {
  @inject(TYPES.TagNameRepository)
  private readonly tagNameRepository!: Repository<TagNameEntity>

  @inject(TYPES.TagRepository)
  private readonly tagRepository!: Repository<TagEntity>

  public tag!: Tag
  public context!: GuildContext

  public constructor () {
    super(TagName)
  }

  public override setOptions (tag: Tag): void {
    this.tag = tag
    this.context = tag.context
  }

  public override add (data: TagNameEntity): TagName {
    return super.add(data, { id: data.name, extras: [this.tag] })
  }

  public async create (name: string): Promise<TagName> {
    name = name.toLowerCase()
    if (this.context.tags.resolve(name) !== null) {
      throw new Error('A tag with that name already exists.')
    }

    const tagNameData = await this.tagNameRepository.save(this.tagNameRepository.create({ name, tagId: this.tag.id }))
    const tagData = await this.tagRepository.findOne({
      where: { id: this.tag.id },
      relations: { names: true }
    }) as TagEntity
    if (typeof tagData.names === 'undefined') {
      tagData.names = []
    }
    tagData.names.push(tagNameData)
    await this.tagRepository.save(tagData)

    return this.add(tagNameData)
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
