import type { ChannelGroup, GuildContext, RoleGroup } from '.'
import BaseStructure from './base'
import type { Group as GroupEntity } from '../entities'
import type { GroupType } from '../utils/constants'
import { injectable } from 'inversify'

export interface GroupUpdateOptions { name?: string }

@injectable()
export default class Group extends BaseStructure<GroupEntity> {
  public context!: GuildContext

  public type!: GroupType
  public id!: number
  public name!: string
  public guarded!: boolean

  public setOptions (data: GroupEntity, context: GuildContext): void {
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
    await this.context.groups.delete(this)
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
