import type { Channel as ChannelEntity, Group as GroupEntity } from '../entities'
import type { Collection, Guild, Snowflake, TextChannel } from 'discord.js'
import type { ChannelGroup } from '../structures'
import type { Repository } from 'typeorm'
import type { TextChannelResolvable } from './guild-ticket'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GroupTextChannelManager {
  @lazyInject(TYPES.GroupRepository)
  private readonly groupRepository!: Repository<GroupEntity>

  public readonly group: ChannelGroup
  public readonly guild: Guild

  public constructor (group: ChannelGroup) {
    this.group = group
    this.guild = group.guild
  }

  public get cache (): Collection<Snowflake, TextChannel> {
    return this.guild.channels.cache.filter(channel => this.group._channels.includes(channel.id)) as
      Collection<Snowflake, TextChannel>
  }

  public async add (channelResolvable: TextChannelResolvable): Promise<ChannelGroup> {
    const channel = this.guild.channels.resolve(channelResolvable)
    if (channel === null || !channel.isText()) {
      throw new Error('Invalid channel.')
    }
    if (this.cache.has(channel.id)) {
      throw new Error('Group already contains channel.')
    }

    const group = await this.groupRepository.findOne(
      this.group.id,
      { relations: ['channels', 'roles'] }
    ) as GroupEntity & { channels: ChannelEntity[] }
    group.channels.push({ id: channel.id, guildId: this.guild.id })
    await this.groupRepository.save(group)
    this.group.setup(group)

    return this.group
  }

  public async remove (channel: TextChannelResolvable): Promise<ChannelGroup> {
    const id = this.guild.channels.resolveId(channel)
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
    this.group.setup(group)

    return this.group
  }
}
