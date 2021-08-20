import type { Channel as ChannelEntity, Group as GroupEntity } from '../entities'
import type { Collection, Guild, GuildChannel, Snowflake } from 'discord.js'
import { inject, injectable } from 'inversify'
import type { ChannelGroup } from '../structures'
import type { Repository } from 'typeorm'
import type { TextChannelResolvable } from './guild-ticket'
import { constants } from '../util'

const { TYPES } = constants

@injectable()
export default class GroupTextChannelManager {
  @inject(TYPES.ChannelRepository) private readonly channelRepository!: Repository<ChannelEntity>
  @inject(TYPES.GroupRepository) private readonly groupRepository!: Repository<GroupEntity>

  public group: ChannelGroup
  public guild: Guild

  public constructor (group: ChannelGroup) {
    this.group = group
    this.guild = group.guild
  }

  public get cache (): Collection<Snowflake, GuildChannel> {
    return this.guild.channels.cache.filter(channel => this.group._channels.includes(channel.id))
  }

  public async add (channelResolvable: TextChannelResolvable): Promise<ChannelGroup> {
    const channel = this.guild.channels.resolve(channelResolvable)
    if (channel === null || !channel.isText()) {
      throw new Error('Invalid channel.')
    }
    if (this.cache.has(channel.id)) {
      throw new Error('Group already contains channel.')
    }

    const channelFields = { id: channel.id, guildId: this.guild.id }
    const channelData = await this.channelRepository.findOne(channelFields) ??
      await this.channelRepository.save(this.channelRepository.create(channelFields))
    const group = await this.groupRepository.findOne(
      this.group.id,
      { relations: ['channels', 'roles'] }
    ) as GroupEntity & { channels: ChannelEntity[] }
    group.channels.push(channelData)
    await this.groupRepository.save(group)
    this.group._channels.push(channel.id)

    return this.group
  }

  public async remove (channel: TextChannelResolvable): Promise<ChannelGroup> {
    const id = this.guild.channels.resolveID(channel)
    if (id === null) {
      throw new Error('Invalid channel.')
    }
    if (!this.group._channels.includes(id)) {
      throw new Error('Group does not contain channel.')
    }

    const group = await this.groupRepository.findOne(
      this.group.id,
      { relations: ['channels', 'roles'] }
    ) as GroupEntity & { channels: ChannelEntity[] }
    group.channels = group.channels.filter(channel => channel.id !== id)
    await this.groupRepository.save(group)
    this.group._channels = this.group._channels.filter(channelId => channelId !== id)

    return this.group
  }
}
