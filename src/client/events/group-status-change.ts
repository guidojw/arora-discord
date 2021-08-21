import type { CommandGroup, CommandoGuild } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import { injectable } from 'inversify'

@injectable()
export default class GroupStatusChangeEventHandler implements BaseHandler {
  public async handle (
    client: Client,
    guild: CommandoGuild,
    group: CommandGroup,
    enabled: boolean
  ): Promise<void> {
    await client.provider.onCommandStatusChange(guild, group, enabled)
  }
}
