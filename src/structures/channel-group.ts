import type Client from '../client/client'
import Group from './group'
import type { Group as GroupEntity } from '../entities'
import GroupTextChannelManager from '../managers/group-text-channel'
import type { Guild } from 'discord.js'

export default class ChannelGroup extends Group {
  public _channels: string[]

  public constructor (client: Client, data: GroupEntity, guild: Guild) {
    super(client, data, guild)

    this._channels = []

    this.setup(data)
  }

  public override setup (data: GroupEntity): void {
    super.setup(data)

    if (typeof data.channels !== 'undefined') {
      this._channels = data.channels.map(channel => channel.id)
    }
  }

  public get channels (): GroupTextChannelManager {
    return new GroupTextChannelManager(this)
  }
}
