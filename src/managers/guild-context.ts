import { CachedManager, type Client, Guild } from 'discord.js'
import { GuildContext } from '../structures'

export type GuildContextResolvable = GuildContext | Guild | string

export default class GuildContextManager extends CachedManager<string, GuildContext, GuildContextResolvable> {
  public constructor (client: Client) {
    super(client, GuildContext)
  }

  public override resolve (guildContext: GuildContext): GuildContext
  public override resolve (guildContext: GuildContextResolvable): GuildContext | null
  public override resolve (guildContext: GuildContextResolvable): GuildContext | null {
    if (guildContext instanceof Guild) {
      return this.cache.find(otherGuildContext => otherGuildContext.id === guildContext.id) ?? null
    }
    return super.resolve(guildContext)
  }

  public override resolveId (guildContext: string): string
  public override resolveId (guildContext: GuildContextResolvable): string | null
  public override resolveId (guildContext: GuildContextResolvable): string | null {
    if (guildContext instanceof Guild) {
      return guildContext.id
    }
    return super.resolveId(guildContext)
  }
}
