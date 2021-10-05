import type { Client, Guild } from 'discord.js'
import Group from './group'
import type { Group as GroupEntity } from '../entities'
import GroupTextChannelManager from '../managers/group-text-channel'

export default class ChannelGroup extends Group {
  public _channels: string[]

  public constructor (client: Client<true>, data: GroupEntity, guild: Guild) {
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
