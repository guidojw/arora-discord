import { type BaseStructure, Tag } from '../structures'
import { BaseStructureArgumentType } from './base'
import type { Tag as TagEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class TagArgumentType extends BaseStructureArgumentType<Tag, TagEntity> {
  public constructor () {
    super(Tag)
  }

  protected override filterExact (search: string): (structure: BaseStructure<TagEntity>) => boolean {
    return structure => structure instanceof this.holds && structure.names.resolve(search) !== null
  }

  protected override filterInexact (search: string): (structure: BaseStructure<TagEntity>) => boolean {
    return structure => structure instanceof this.holds && structure.names.cache.some(tagName => (
      tagName.name.toLowerCase().includes(search)
    ))
  }
}
