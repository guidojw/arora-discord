import BaseStructure from './base'
import type GuildContext from './guild-context'
import type { Role } from 'discord.js'
import type { RoleBinding as RoleBindingEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class RoleBinding extends BaseStructure<RoleBindingEntity> {
  public context!: GuildContext

  public id!: number
  public roleId!: string
  public robloxGroupId!: number
  public min!: number
  public max!: number | null

  public setOptions (data: RoleBindingEntity, context: GuildContext): void {
    this.context = context

    this.setup(data)
  }

  public setup (data: RoleBindingEntity): void {
    this.id = data.id
    this.roleId = data.roleId
    this.robloxGroupId = data.robloxGroupId
    this.min = data.min
    this.max = data.max ?? null
  }

  public get role (): Role | null {
    return this.context.guild.roles.cache.get(this.roleId) ?? null
  }

  public async delete (): Promise<void> {
    return await this.context.roleBindings.delete(this)
  }
}
