import { inject, injectable } from 'inversify'
import type { BaseHandler } from '..'
import type { Channel } from '../../entities'
import type { Channel as DiscordChannel } from 'discord.js'
import { Repository } from 'typeorm'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class ChannelDeleteEventHandler implements BaseHandler {
  @inject(TYPES.ChannelRepository)
  private readonly channelRepository!: Repository<Channel>

  public async handle (channel: DiscordChannel): Promise<void> {
    await this.channelRepository.delete(channel.id)
  }
}
