import BaseStructure from './base'
import type ChannelGroup from './channel-group'
import type { Client } from 'discord.js'
import type { Group as GroupEntity } from '../entities'
import { GroupType } from '../utils/constants'
import type GuildContext from './guild-context'
import type RoleGroup from './role-group'

export interface GroupUpdateOptions { name?: string }

export default class Group extends BaseStructure {
  public readonly context: GuildContext
  public readonly type: GroupType

  public id!: number
  public name!: string
  public guarded!: boolean

  public constructor (client: Client<true>, data: GroupEntity, context: GuildContext) {
    super(client)

    this.type = data.type
    this.context = context
  }

  public setup (data: GroupEntity): void {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
  }

  public async update (data: GroupUpdateOptions): Promise<Group> {
    return await this.context.groups.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.context.groups.delete(this)
  }

  public static create (client: Client, data: GroupEntity, context: GuildContext): Group {
    let group
    switch (data.type) {
      case GroupType.Channel: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ChannelGroup = require('./channel-group').default
        group = new ChannelGroup(client, data, context)
        break
      }
      case GroupType.Role: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RoleGroup = require('./role-group').default
        group = new RoleGroup(client, data, context)
        break
      }
    }
    return group
  }

  public isChannelGroup (): this is ChannelGroup {
    return this.type === 'channel'
  }

  public isRoleGroup (): this is RoleGroup {
    return this.type === 'role'
  }

  public override toString (): string {
    return this.name
  }
}
