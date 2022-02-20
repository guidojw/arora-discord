import type { GuildChannel, TextChannel, VoiceChannel } from 'discord.js'
import { inject, injectable } from 'inversify'
import type { Channel as ChannelEntity } from '../entities'
import { Collection } from 'discord.js'
import type { Repository } from 'typeorm'
import { constants } from '../util'

const { TYPES } = constants

@injectable()
export default class ChannelLinkService {
  @inject(TYPES.ChannelRepository)
  private readonly channelRepository!: Repository<ChannelEntity>

  public async fetchToLinks (channel: VoiceChannel): Promise<Collection<string, TextChannel>> {
    const data = await this.getData(channel)

    return channel.guild.channels.cache.filter(otherChannel => (
      otherChannel.isText() && data?.toLinks.some(link => link.id === otherChannel.id)) === true
    ) as Collection<string, TextChannel>
  }

  public async linkChannel (voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<void> {
    const data = await this.getData(voiceChannel) ?? await this.channelRepository.save(this.channelRepository.create({
      id: voiceChannel.id,
      guildId: voiceChannel.guild.id
    }))
    if (typeof data.toLinks === 'undefined') {
      data.toLinks = []
    }

    if (data.toLinks.some(link => link.id === textChannel.id)) {
      throw new Error('Voice channel does already have linked text channel.')
    } else {
      data.toLinks.push({ id: textChannel.id, guildId: voiceChannel.guild.id })
      await this.channelRepository.save(data)
    }
  }

  public async unlinkChannel (voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<void> {
    const data = await this.getData(voiceChannel)

    if (typeof data === 'undefined' || !data?.toLinks.some(link => link.id === textChannel.id)) {
      throw new Error('Voice channel does not have linked text channel.')
    } else {
      data.toLinks = data.toLinks.filter(link => link.id !== textChannel.id)
      await this.channelRepository.save(data)
    }
  }

  private async getData (channel: GuildChannel): Promise<(ChannelEntity & { toLinks: ChannelEntity[] }) | undefined> {
    return await this.channelRepository.findOne(
      { id: channel.id, guildId: channel.guild.id },
      { relations: ['toLinks'] }
    ) as (ChannelEntity & { toLinks: ChannelEntity[] }) | undefined
  }
}