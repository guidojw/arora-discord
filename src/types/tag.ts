import type { BaseStructure } from '../structures'
import { BaseStructureArgumentType } from './base'
import { Tag } from '../structures'
import { injectable } from 'inversify'

@injectable()
export default class TagArgumentType extends BaseStructureArgumentType<Tag> {
  public constructor () {
    super(Tag, 'tags')
  }

  public override filterExact (search: string): (structure: BaseStructure) => boolean {
    return structure => structure instanceof this.holds && structure.names.resolve(search) !== null
  }

  public override filterInexact (search: string): (structure: BaseStructure) => boolean {
    return structure => structure instanceof this.holds && structure.names.cache.some(tagName => (
      tagName.name.toLowerCase().includes(search)
    ))
  }
}