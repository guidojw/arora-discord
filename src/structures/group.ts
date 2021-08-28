import type { Client, Guild } from 'discord.js'
import BaseStructure from './base'
import type ChannelGroup from './channel-group'
import type { Group as GroupEntity } from '../entities'
import { GroupType } from '../util/constants'
import type RoleGroup from './role-group'

export interface GroupUpdateOptions { name?: string }

export default class Group extends BaseStructure {
  public readonly type: GroupType
  public readonly guild: Guild
  public id!: number
  public name!: string
  public guarded!: boolean

  public constructor (client: Client, data: GroupEntity, guild: Guild) {
    super(client)

    this.type = data.type
    this.guild = guild
  }

  public setup (data: GroupEntity): void {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
  }

  public async update (data: GroupUpdateOptions): Promise<Group> {
    return await this.guild.groups.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.groups.delete(this)
  }

  public static create (client: Client, data: GroupEntity, guild: Guild): Group {
    let group
    switch (data.type) {
      case GroupType.Channel: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ChannelGroup = require('./channel-group').default
        group = new ChannelGroup(client, data, guild)
        break
      }
      case GroupType.Role: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RoleGroup = require('./role-group').default
        group = new RoleGroup(client, data, guild)
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
