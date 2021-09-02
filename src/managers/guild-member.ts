import { Collection, GuildMemberManager } from 'discord.js'
import type { FetchMemberOptions, FetchMembersOptions, GuildMember, Snowflake, UserResolvable } from 'discord.js'
import { userService } from '../services'

export default class AroraGuildMemberManager extends GuildMemberManager {
  public override fetch (options: number): Promise<Collection<Snowflake, GuildMember>>
  public override fetch (
    options: UserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: UserResolvable })
  ): Promise<GuildMember>
  public override fetch (options?: FetchMembersOptions): Promise<Collection<Snowflake, GuildMember>>
  public override async fetch (
    options?: number | UserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: UserResolvable }) |
    FetchMembersOptions
  ): Promise<GuildMember | Collection<Snowflake, GuildMember>> {
    if (typeof options === 'number') {
      if (this.guild.robloxUsernamesInNicknames) {
        const username = (await userService.getUser(options)).name
        const usernameRegex = new RegExp(`(?:^|\\s+)(${username})(?:$|\\s+)`)
        return (await this.fetch()).filter(member => usernameRegex.test(member.displayName))
      } else {
        return this.cache.filter(member => member.robloxId === options)
      }
    } else if (typeof options === 'string') {
      if (!/^[0-9]+$/.test(options)) {
        if (this.guild.robloxUsernamesInNicknames) {
          const usernameRegex = new RegExp(`(?:^|\\s+)(${options})(?:$|\\s+)`)
          return (await this.fetch()).filter(member => usernameRegex.test(member.displayName))
        } else {
          return new Collection()
        }
      }
    }
    // @ts-expect-error
    return await super.fetch(options)
  }
}
