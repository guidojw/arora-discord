import type { Collection, GuildChannel, TextChannel, VoiceChannel } from 'discord.js'
import type { Channel as ChannelEntity } from '../entities'
import type { Repository } from 'typeorm'
import { Structures } from 'discord.js'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

declare module 'discord.js' {
  interface VoiceChannel {
    fetchToLinks: () => Promise<Collection<string, TextChannel>>
    linkChannel: (channel: TextChannel) => Promise<this>
    unlinkChannel: (channel: TextChannel) => Promise<this>
  }
}

// @ts-expect-error
const AroraVoiceChannel: VoiceChannel = Structures.extend('VoiceChannel', VoiceChannel => {
  class AroraVoiceChannel extends VoiceChannel {
    @lazyInject(TYPES.ChannelRepository)
    private readonly channelRepository!: Repository<ChannelEntity>

    // @ts-expect-error
    public override async fetchToLinks (): Promise<Collection<string, TextChannel>> {
      const data = await this.getData(this)

      return this.guild.channels.cache.filter(channel => (
        channel.isText() && data?.toLinks.some(link => link.id === channel.id)) === true
      ) as Collection<string, TextChannel>
    }

    // @ts-expect-error
    public override async linkChannel (channel: TextChannel): Promise<this> {
      const data = await this.getData(this) ?? await this.channelRepository.save(this.channelRepository.create({
        id: this.id,
        guildId: this.guild.id
      }))
      if (typeof data.toLinks === 'undefined') {
        data.toLinks = []
      }

      if (data.toLinks.some(link => link.id === channel.id)) {
        throw new Error('Voice channel does already have linked text channel.')
      } else {
        data.toLinks.push({ id: channel.id, guildId: this.guild.id })
        await this.channelRepository.save(data)
        return this
      }
    }

    // @ts-expect-error
    public override async unlinkChannel (channel: TextChannel): Promise<this> {
      const data = await this.getData(this)

      if (typeof data === 'undefined' || !data?.toLinks.some(link => link.id === channel.id)) {
        throw new Error('Voice channel does not have linked text channel.')
      } else {
        data.toLinks = data.toLinks.filter(link => link.id !== channel.id)
        await this.channelRepository.save(data)
        return this
      }
    }

    private async getData (channel: GuildChannel): Promise<(ChannelEntity & { toLinks: ChannelEntity[] }) | undefined> {
      return await this.channelRepository.findOne(
        { id: channel.id, guildId: channel.guild.id },
        { relations: ['toLinks'] }
      ) as (ChannelEntity & { toLinks: ChannelEntity[] }) | undefined
    }
  }

  return AroraVoiceChannel
})

export default AroraVoiceChannel
