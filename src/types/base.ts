import type { Argument, CommandoMessage } from 'discord.js-commando'
import { ArgumentType, CommandoClient, util } from 'discord.js-commando'
import { Collection, Util } from 'discord.js'
import { BaseStructure } from '../structures'
import type { Constructor } from '../util/util'
import lodash from 'lodash'
import pluralize from 'pluralize'

const { disambiguation } = util
const { escapeMarkdown } = Util

export interface IdentifiableStructure extends BaseStructure {
  id: number
}

export abstract class FilterableArgumentType<T> {
  public abstract filterExact: (search: string) => (structure: T) => boolean
  public abstract filterInexact: (search: string) => (structure: T) => boolean
}

export default class BaseArgumentType<T extends IdentifiableStructure> extends ArgumentType implements
FilterableArgumentType<T> {
  protected readonly holds: Constructor<T>

  private readonly managerName: string
  private readonly label: string

  public constructor (client: CommandoClient, holds: Constructor<T>, managerName?: string) {
    let id = lodash.kebabCase(holds.name)
    if (client.registry.types.has(id)) {
      id = `arora-${id}`
    }
    super(client, id)

    this.holds = holds
    this.managerName = typeof managerName === 'undefined'
      ? pluralize(lodash.camelCase(holds.name))
      : managerName

    this.label = this.id.replace(/-/g, ' ')
  }

  public validate (val: string, msg: CommandoMessage, arg: Argument): boolean | string {
    if (typeof msg.guild === 'undefined') {
      return false
    }
    const id = parseInt(val)
    if (!isNaN(id)) {
      // @ts-expect-error
      const structure = msg.guild[this.managerName].cache.get(id)
      if (typeof structure === 'undefined') {
        return false
      }
      return arg.oneOf?.includes(structure.id) ?? true
    }
    const search = val.toLowerCase()
    // @ts-expect-error
    let structures: Collection<number, T> = msg.guild[this.managerName].cache
      .filter(this.filterInexact(search))
    if (structures.size === 0) {
      return false
    }
    if (structures.size === 1) {
      return arg.oneOf?.includes(String((structures.first() as T).id)) ?? true
    }
    const exactStructures = structures.filter(this.filterExact(search))
    if (exactStructures.size === 1) {
      return arg.oneOf?.includes(String((exactStructures.first() as T).id)) ?? true
    }
    if (exactStructures.size > 0) {
      structures = exactStructures
    }
    return structures.size <= 15
      ? `${disambiguation(structures.map(structure => escapeMarkdown(structure.toString())), pluralize(this.label), undefined)}\n`
      : `Multiple ${pluralize(this.label)} found. Please be more specific.`
  }

  public parse (val: string, msg: CommandoMessage): T | null | false {
    if (typeof msg.guild === 'undefined') {
      return false
    }
    const id = parseInt(val)
    if (!isNaN(id)) {
      // @ts-expect-error
      return msg.guild[this.managerName].cache.get(id) ?? null
    }
    const search = val.toLowerCase()
    // @ts-expect-error
    const structures = msg.guild[this.managerName].cache.filter(this.filterInexact(search))
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
