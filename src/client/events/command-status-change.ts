import type { Command, CommandoGuild } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import { injectable } from 'inversify'

@injectable()
export default class CommandStatusChangeEventHandler implements BaseHandler {
  public async handle (
    client: Client,
    guild: CommandoGuild,
    command: Command,
    enabled: boolean
  ): Promise<void> {
    await client.provider.onCommandStatusChange(guild, command, enabled)
  }
}
