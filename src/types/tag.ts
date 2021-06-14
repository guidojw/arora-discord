import BaseArgumentType, { FilterableArgumentType } from './base'
import { BaseStructure, Tag } from '../structures'
import { CommandoClient } from 'discord.js-commando'

export default class TagArgumentType extends BaseArgumentType<Tag> implements FilterableArgumentType<Tag> {
  public constructor (client: CommandoClient) {
    super(client, Tag)
  }

  public filterExact (search: string): (structure: BaseStructure) => boolean {
    return structure => structure instanceof this.holds && structure.names.resolve(search) !== null
  }

  public filterInexact (search: string): (structure: BaseStructure) => boolean {
    return structure => structure instanceof this.holds && structure.names.cache.some(tagName => (
      tagName.name.toLowerCase().includes(search)
    ))
  }
}
