import BaseStructure from './base'
import Client from '../client/client'
import { GroupType } from '../util/constants'
import { Guild } from 'discord.js'

export default class Group extends BaseStructure {
  public readonly type: GroupType
  public readonly guild: Guild
  public id!: number
  public name!: string
  public guarded!: boolean

  public constructor (client: Client, data: any, guild: Guild) {
    super(client)

    this.type = data.type
    this.guild = guild
  }

  public setup (data: any): void {
    this.id = data.id
    this.name = data.name
    this.guarded = data.guarded
  }

  public toString (): string {
    return this.name
  }

  public async update (data: any): Promise<this> {
    return await this.guild.groups.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.groups.delete(this)
  }

  public static create (client: Client, data: any, guild: Guild): Group {
    let group
    switch (data.type) {
      case GroupType.Channel: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ChannelGroup = require('./channel-group')
        group = new ChannelGroup(client, data, guild)
        break
      }
      case GroupType.Role: {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RoleGroup = require('./role-group')
        group = new RoleGroup(client, data, guild)
        break
      }
    }
    return group
  }
}
