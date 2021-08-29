import { BaseManager as DiscordBaseManager } from 'discord.js'
import type { IdentifiableStructure } from '../types/base'

export default class BaseManager<Holds extends IdentifiableStructure, R> extends DiscordBaseManager<number, Holds, R> {
  public override resolve (resolvable: R): Holds | null {
    if (resolvable instanceof this.holds) {
      return resolvable
    }
    if (typeof resolvable === 'number') {
      return this.cache.get(resolvable) ?? null
    }
    return null
  }

  public override resolveID (resolvable: R): number | null {
    if (resolvable instanceof this.holds) {
      return resolvable.id
    }
    if (typeof resolvable === 'number') {
      return resolvable
    }
    return null
  }
}
