import { BaseStructure, Tag } from '../structures'
import BaseArgumentType from './base'
import type { CommandoClient } from 'discord.js-commando'
import type { FilterableArgumentType } from './base'

export default class TagArgumentType extends BaseArgumentType<Tag> implements FilterableArgumentType<Tag> {
  public constructor (client: CommandoClient) {
    super(client, Tag)
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
