import type { Collection, Guild, Snowflake, TextChannel } from 'discord.js'
import type { ChannelGroup } from '../structures'

export default class TextChannelGroupManager {
  public channel: TextChannel
  public guild: Guild

  public constructor (channel: TextChannel) {
    this.channel = channel
    this.guild = channel.guild
  }

  public get cache (): Collection<Snowflake, ChannelGroup> {
    return this.guild.groups.cache.filter(group => {
      return group.isChannelGroup() && group.channels.cache.has(this.channel.id)
    })
  }
}
