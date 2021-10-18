import type { BaseStructure, GuildContext } from '../structures'
import type { Argument } from '../commands'
import type { CommandInteraction } from 'discord.js'
import type { Constructor } from '../util/util'
import lodash from 'lodash'
import pluralize from 'pluralize'

export interface IdentifiableStructure extends BaseStructure {
  id: number
  toString: () => string
}

export default abstract class BaseArgumentType<T> {
  public abstract validate (
    value: string,
    interaction: CommandInteraction,
    arg: Argument<T>
  ): boolean | string | Promise<boolean | string>

  public abstract parse (
    value: string,
    interaction: CommandInteraction,
    arg: Argument<T>
  ): T | null | Promise<T | null>
}

export class BaseStructureArgumentType<T extends IdentifiableStructure> {
  protected readonly holds: Constructor<T>

  private readonly managerName: string

  public constructor (holds: Constructor<T>, managerName?: string) {
    this.holds = holds
    this.managerName = typeof managerName === 'undefined'
      ? pluralize(lodash.camelCase(holds.name))
      : managerName
  }

  public validate (
    value: string,
    interaction: CommandInteraction,
    _arg: Argument<T>
  ): boolean | string | Promise<boolean | string> {
    if (!interaction.inCachedGuild()) {
      return false
    }
    const context = interaction.client.guildContexts.resolve(interaction.guildId) as GuildContext

    const id = parseInt(value)
    if (!isNaN(id)) {
      // @ts-expect-error
      const structure = context[this.managerName].cache.get(id)
      return typeof structure !== 'undefined'
    }
    const search = value.toLowerCase()
    // @ts-expect-error
    const structures: Collection<number, T> = context[this.managerName].cache
      .filter(this.filterInexact(search))
    if (structures.size === 1) {
      return true
    }
    const exactStructures = structures.filter(this.filterExact(search))
    return exactStructures.size === 1
  }

  public parse (
    value: string,
    interaction: CommandInteraction,
    _arg: Argument<T>
  ): T | null | Promise<T | null> {
    if (!interaction.inCachedGuild()) {
      return null
    }
    const context = interaction.client.guildContexts.resolve(interaction.guildId) as GuildContext

    const id = parseInt(value)
    if (!isNaN(id)) {
      // @ts-expect-error
      return context[this.managerName].cache.get(id) ?? null
    }
    const search = value.toLowerCase()
    // @ts-expect-error
    const structures = context[this.managerName].cache.filter(this.filterInexact(search))
    if (structures.size === 0) {
      return null
    }
    if (structures.size === 1) {
      return structures.first()
    }
    const exactStructures = structures.filter(this.filterExact(search))
    if (exactStructures.size === 1) {
      return exactStructures.first()
    }
    return null
  }

  public filterExact (search: string): (structure: T) => boolean {
    return structure => structure instanceof this.holds && structure.toString().toLowerCase() === search
  }

  public filterInexact (search: string): (structure: T) => boolean {
    return structure => structure instanceof this.holds && structure.toString().toLowerCase().includes(search)
  }
}
