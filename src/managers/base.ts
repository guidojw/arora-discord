import { type Constructor, type Tail, constants } from '../utils'
import { inject, injectable } from 'inversify'
import { Collection } from 'discord.js'
import type { IdentifiableEntity } from '../entities'
import type { IdentifiableStructure } from '../structures'

const { TYPES } = constants

@injectable()
export default abstract class BaseManager<K extends number | string, Holds extends { id: K }, R> {
  public abstract readonly cache: Collection<K, Holds>

  public readonly holds: Constructor<Holds>

  public constructor (holds: Constructor<Holds>) {
    this.holds = holds
  }

  public setOptions? (...args: any[]): void

  public resolve (resolvable: Holds): Holds
  public resolve (resolvable: R): Holds | null
  public resolve (resolvable: Holds | R): Holds | null {
    if (resolvable instanceof this.holds) {
      return resolvable
    }
    const other = this.cache.first()
    if (typeof other !== 'undefined') {
      if (typeof resolvable === typeof other.id) {
        return this.cache.get(resolvable as unknown as K) ?? null
      }
    }
    return null
  }

  public resolveId (resolvable: K | Holds): K
  public resolveId (resolvable: R): K | null
  public resolveId (resolvable: K | Holds | R): K | null {
    if (resolvable instanceof this.holds) {
      return resolvable.id
    }
    const other = this.cache.first()
    if (typeof other !== 'undefined') {
      if (typeof resolvable === typeof other.id) {
        return resolvable as K
      }
    }
    return null
  }
}

export class DataManager<
  K extends number | string,
  Holds extends IdentifiableStructure<K, U>,
  R,
  U extends IdentifiableEntity
> extends BaseManager<K, Holds, R> {
  @inject(TYPES.StructureFactory)
  private readonly structureFactory!: (structureName: string) => (...args: Parameters<Holds['setOptions']>) => Holds

  public readonly cache: Collection<K, Holds> = new Collection()

  public add (
    data: Parameters<Holds['setOptions']>[0],
    options?: { id?: K, extras: Tail<Parameters<Holds['setOptions']>> }
  ): Holds {
    const existing = this.cache.get(options?.id ?? data.id as K)
    if (typeof existing !== 'undefined') {
      existing.setup(data)
      return existing
    }

    const entry = this.structureFactory(this.holds.name)(
      ...[data, ...(options?.extras ?? [])] as unknown as Parameters<Holds['setOptions']>
    )
    this.cache.set(options?.id ?? entry.id, entry)
    return entry
  }
}
