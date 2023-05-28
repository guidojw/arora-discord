import type { Channel as ChannelEntity, Group as GroupEntity } from '../entities'
import type { ChannelGroup, GuildContext } from '../structures'
import { ChannelType, type Collection, type Snowflake, type TextChannel, type TextChannelResolvable } from 'discord.js'
import { inject, injectable } from 'inversify'
import BaseManager from './base'
import { Repository } from 'typeorm'
import { constants } from '../utils'

const { TYPES } = constants

@injectable()
export default class GroupTextChannelManager extends BaseManager<string, TextChannel, TextChannelResolvable> {
  @inject(TYPES.GroupRepository)
  private readonly groupRepository!: Repository<GroupEntity>

  public group!: ChannelGroup
  public context!: GuildContext

  public override setOptions (group: ChannelGroup): void {
    this.group = group
    this.context = group.context
  }

  public get cache (): Collection<Snowflake, TextChannel> {
    return this.context.guild.channels.cache.filter(channel => this.group._channels.includes(channel.id)) as
      Collection<Snowflake, TextChannel>
  }

  public async add (channelResolvable: TextChannelResolvable): Promise<ChannelGroup> {
    const channel = this.context.guild.channels.resolve(channelResolvable)
    if (channel === null || channel.type !== ChannelType.GuildText) {
      throw new Error('Invalid channel.')
    }
    if (this.cache.has(channel.id)) {
      throw new Error('Group already contains channel.')
    }

    const group = await this.groupRepository.findOne({
      where: { id: this.group.id },
      relations: { channels: true, roles: true }
    }) as GroupEntity & { channels: ChannelEntity[] }
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

    const group = await this.groupRepository.findOne({
      where: { id: this.group.id },
      relations: { channels: true, roles: true }
    }) as GroupEntity & { channels: ChannelEntity[] }
    group.channels = group.channels.filter(channel => channel.id !== id)
    await this.groupRepository.save(group)
    this.group.setup(group)

    return this.group
  }
}
