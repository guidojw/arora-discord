import type { Collection, GuildChannel, TextChannel, VoiceBasedChannel } from 'discord.js'
import { inject, injectable } from 'inversify'
import type { Channel as ChannelEntity } from '../entities'
import { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

@injectable()
export default class ChannelLinkService {
  @inject(TYPES.ChannelRepository)
  private readonly channelRepository!: Repository<ChannelEntity>

  public async fetchToLinks (channel: VoiceBasedChannel): Promise<Collection<string, TextChannel>> {
    const data = await this.getData(channel)

    return channel.guild.channels.cache.filter(otherChannel => (
      otherChannel.isText() && data?.toLinks.some(link => link.id === otherChannel.id)) === true
    ) as Collection<string, TextChannel>
  }

  public async linkChannel (voiceChannel: VoiceBasedChannel, textChannel: TextChannel): Promise<void> {
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

  public async unlinkChannel (voiceChannel: VoiceBasedChannel, textChannel: TextChannel): Promise<void> {
    const data = await this.getData(voiceChannel)

    if (data === null || !data?.toLinks.some(link => link.id === textChannel.id)) {
      throw new Error('Voice channel does not have linked text channel.')
    } else {
      data.toLinks = data.toLinks.filter(link => link.id !== textChannel.id)
      await this.channelRepository.save(data)
    }
  }

  private async getData (channel: GuildChannel): Promise<(ChannelEntity & { toLinks: ChannelEntity[] }) | null> {
    return await this.channelRepository.findOne({
      where: { id: channel.id, guildId: channel.guild.id },
      relations: { toLinks: true }
    }) as (ChannelEntity & { toLinks: ChannelEntity[] }) | null
  }
}
