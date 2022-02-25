import { CachedManager, type Client } from 'discord.js'
import type { IdentifiableStructure } from '../types'

// @ts-expect-error
export default class BaseManager<Holds extends IdentifiableStructure, R> extends CachedManager<number, Holds, R> {
  public override readonly client!: Client<true>

  public override _add (data: unknown, cache?: boolean, extra?: { id: number, extras: unknown[] }): Holds {
    // @ts-expect-error
    return super._add(data, cache, extra)
  }

  public override resolve (resolvable: Holds): Holds
  public override resolve (resolvable: R): Holds | null
  public override resolve (resolvable: Holds | R): Holds | null {
    if (resolvable instanceof this.holds) {
      return resolvable
    }
    if (typeof resolvable === 'number') {
      return this.cache.get(resolvable) ?? null
    }
    return null
  }

  public override resolveId (resolvable: number | Holds): number
  public override resolveId (resolvable: R): number | null
  public override resolveId (resolvable: number | Holds | R): number | null {
    if (resolvable instanceof this.holds) {
      return resolvable.id
    }
    if (typeof resolvable === 'number') {
      return resolvable
    }
    return null
  }
}
