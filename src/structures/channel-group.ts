import { type ManagerFactory, constants } from '../utils'
import { inject, injectable } from 'inversify'
import Group from './group'
import type { Group as GroupEntity } from '../entities'
import type { GroupTextChannelManager } from '../managers'
import type { GuildContext } from '.'
import type { TextChannel } from 'discord.js'

const { TYPES } = constants

@injectable()
export default class ChannelGroup extends Group {
  @inject(TYPES.ManagerFactory)
  private readonly managerFactory!: ManagerFactory

  public _channels: string[]

  public constructor () {
    super()

    this._channels = []
  }

  public override setOptions (data: GroupEntity, context: GuildContext): void {
    super.setOptions(data, context)

    this.setup(data)
  }

  public override setup (data: GroupEntity): void {
    super.setup(data)

    if (typeof data.channels !== 'undefined') {
      this._channels = data.channels.map(channel => channel.id)
    }
  }

  public get channels (): GroupTextChannelManager {
    return this.managerFactory<GroupTextChannelManager, TextChannel>('GroupTextChannelManager')(this)
  }
}
