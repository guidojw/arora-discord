import { inject, injectable } from 'inversify'
import type BaseHandler from '../base'
import type { Channel } from '../../entities'
import type Client from '../client'
import type { Channel as DiscordChannel } from 'discord.js'
import type { Repository } from 'typeorm'
import { constants } from '../../util'

const { TYPES } = constants

@injectable()
export default class ChannelDeleteEventHandler implements BaseHandler {
  @inject(TYPES.ChannelRepository)
  private readonly channelRepository!: Repository<Channel>

  public async handle (_client: Client, channel: DiscordChannel): Promise<void> {
    await this.channelRepository.delete(channel.id)
  }
}
