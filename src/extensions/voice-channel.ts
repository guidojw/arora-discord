import { Collection, GuildChannel, Structures, TextChannel, VoiceChannel } from 'discord.js'
import { Channel } from '../models'

declare module 'discord.js' {
  interface VoiceChannel {
    fetchToLinks (): Promise<Collection<string, TextChannel>>
    linkChannel (channel: TextChannel): Promise<this>
    unlinkChannel (channel: TextChannel): Promise<this>
  }
}

// @ts-expect-error
const AroraVoiceChannel: VoiceChannel = Structures.extend('VoiceChannel', VoiceChannel => (
  class AroraVoiceChannel extends VoiceChannel {
    public async fetchToLinks (): Promise<Collection<string, TextChannel>> {
      const data = await getData(this)
      const toLinks = await data?.getToLinks() ?? []

      return this.guild.channels.cache.filter(channel => (
        channel.isText() && toLinks.some((link: { id: string }) => link.id === channel.id))
      ) as Collection<string, TextChannel>
    }

    public async linkChannel (channel: TextChannel): Promise<this> {
      const [data] = await Channel.findOrCreate({ where: { id: this.id, guildId: this.guild.id } })
      await Channel.findOrCreate({ where: { id: channel.id, guildId: this.guild.id } })
      const added = typeof await data.addToLink(channel.id) !== 'undefined'

      if (!added) {
        throw new Error('Voice channel does already have linked text channel.')
      } else {
        return this
      }
    }

    public async unlinkChannel (channel: TextChannel): Promise<this> {
      const data = await getData(this)
      const removed = await data?.removeToLink(channel.id) === 1

      if (!removed) {
        throw new Error('Voice channel does not have linked text channel.')
      } else {
        return this
      }
    }
  }
))

export default AroraVoiceChannel

async function getData (channel: GuildChannel): Promise<Channel> {
  return Channel.findOne({
    where: {
      id: channel.id,
      guildId: channel.guild.id
    }
  })
}
