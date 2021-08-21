import type { Collection, Guild, TextChannel } from 'discord.js'
import type { ChannelGroup } from '../structures'

export default class TextChannelGroupManager {
  private readonly channel: TextChannel
  private readonly guild: Guild

  public constructor (channel: TextChannel) {
    this.channel = channel
    this.guild = channel.guild
  }

  public get cache (): Collection<number, ChannelGroup> {
    return this.guild.groups.cache.filter(group => {
      return group.isChannelGroup() && group.channels.cache.has(this.channel.id)
    }) as Collection<number, ChannelGroup>
  }
}
