import Client from '../client/client'
import Group from './group'
import GroupTextChannelManager from '../managers/group-text-channel'
import { Guild } from 'discord.js'

export default class ChannelGroup extends Group {
  public _channels: string[]

  public constructor (client: Client, data: any, guild: Guild) {
    super(client, data, guild)

    this._channels = []

    this.setup(data)
  }

  public setup (data: any): void {
    super.setup(data)

    if (typeof data.channels !== 'undefined') {
      this._channels = data.channels.map((channel: { id: string }) => channel.id)
    }
  }

  public get channels (): GroupTextChannelManager {
    return new GroupTextChannelManager(this)
  }
}
