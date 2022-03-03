import type { BaseManager, GroupTextChannelManager } from '../managers'
import { inject, injectable } from 'inversify'
import Group from './group'
import type { Group as GroupEntity } from '../entities'
import type { GuildContext } from '.'
import type { TextChannel } from 'discord.js'
import { constants } from '../utils'

const { TYPES } = constants

@injectable()
export default class ChannelGroup extends Group {
  @inject(TYPES.ManagerFactory)
  private readonly managerFactory!: <
    T extends BaseManager<K, U, unknown>,
    U extends { id: K },
    K extends number | string = number | string
    > (managerName: string) => (...args: T['setOptions'] extends ((...args: infer P) => any) ? P : never[]) => T

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
