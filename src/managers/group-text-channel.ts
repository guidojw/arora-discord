import type { Channel as ChannelEntity, Group as GroupEntity } from '../entities'
import type { ChannelGroup, GuildContext } from '../structures'
import type { Collection, Snowflake, TextChannel } from 'discord.js'
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
  public readonly context: GuildContext

  public constructor (group: ChannelGroup) {
    this.group = group
    this.context = group.context
  }

  public get cache (): Collection<Snowflake, TextChannel> {
    return this.context.guild.channels.cache.filter(channel => this.group._channels.includes(channel.id)) as
      Collection<Snowflake, TextChannel>
  }

  public async add (channelResolvable: TextChannelResolvable): Promise<ChannelGroup> {
    const channel = this.context.guild.channels.resolve(channelResolvable)
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
    group.channels.push({ id: channel.id, guildId: this.context.id })
    await this.groupRepository.save(group)
    this.group.setup(group)

    return this.group
  }

  public async remove (channel: TextChannelResolvable): Promise<ChannelGroup> {
    const id = this.context.guild.channels.resolveId(channel)
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
