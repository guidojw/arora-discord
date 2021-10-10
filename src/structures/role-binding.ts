import type { Client, Role } from 'discord.js'
import BaseStructure from './base'
import type GuildContext from './guild-context'
import type { RoleBinding as RoleBindingEntity } from '../entities'

export default class RoleBinding extends BaseStructure {
  public readonly context: GuildContext

  public id!: number
  public roleId!: string
  public robloxGroupId!: number
  public min!: number
  public max!: number | null

  public constructor (client: Client<true>, data: RoleBindingEntity, context: GuildContext) {
    super(client)

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
