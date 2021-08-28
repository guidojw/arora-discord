import type BaseHandler from '../base'
import type Client from '../client'
import type { CommandoGuild } from 'discord.js-commando'
import { injectable } from 'inversify'

@injectable()
export default class CommandPrefixChangeEventHandler implements BaseHandler {
  public async handle (client: Client, guild: CommandoGuild, prefix: string): Promise<void> {
    await client.provider.onCommandPrefixChange(guild, prefix)
  }
}
