import type { CachedManager, Collection, CommandInteraction } from 'discord.js'
import type { GuildContext, IdentifiableStructure } from '../structures'
import { inject, injectable, named, unmanaged } from 'inversify'
import type { Argument } from '../commands'
import type { Constructor } from '../utils/util'
import type { GuildContextManager } from '../managers'
import type { IdentifiableEntity } from '../entities'
import { constants } from '../utils'
import lodash from 'lodash'
import pluralize from 'pluralize'

const { TYPES } = constants

@injectable()
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

export class BaseStructureArgumentType<
  T extends IdentifiableStructure<number, U>,
  U extends IdentifiableEntity
> extends BaseArgumentType<T> {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  protected readonly holds: Constructor<T>

  private readonly managerName: string

  public constructor (@unmanaged() holds: Constructor<T>, @unmanaged() managerName?: string) {
    super()

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
    if (!interaction.inGuild()) {
      return false
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const manager = context[this.managerName as keyof typeof context] as unknown as CachedManager<number, any, any>
    const id = parseInt(value)
    if (!isNaN(id)) {
      const structure = manager.cache.get(id)
      return typeof structure !== 'undefined' && structure instanceof this.holds
    }
    const search = value.toLowerCase()
    const structures: Collection<number, T> = manager.cache.filter(this.filterInexact(search))
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
    if (!interaction.inGuild()) {
      return null
    }
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const manager = context[this.managerName as keyof typeof context] as unknown as CachedManager<number, any, any>
    const id = parseInt(value)
    if (!isNaN(id)) {
      return manager.cache.get(id) ?? null
    }
    const search = value.toLowerCase()
    const structures = manager.cache.filter(this.filterInexact(search))
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
