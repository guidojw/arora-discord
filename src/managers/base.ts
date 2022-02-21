import { CachedManager, type Client, type Constructable } from 'discord.js'

export default class BaseManager<Holds extends { id: number }, R> extends CachedManager<number, Holds, R> {
  public override readonly client: Client<true>

  public constructor (client: Client<true>, holds: Constructable<Holds>) {
    super(client, holds)
    this.client = client
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
