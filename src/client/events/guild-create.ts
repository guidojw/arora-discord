import type BaseHandler from '../base'
import type Client from '../client'
import type { Guild } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
export default class GuildCreateEventHandler implements BaseHandler {
  public async handle (client: Client, guild: Guild): Promise<void> {
    await client.provider.setupGuild(guild.id)
  }
}
