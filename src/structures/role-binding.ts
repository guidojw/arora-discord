import type { Guild, Role } from 'discord.js'
import BaseStructure from './base'
import type Client from '../client/client'
import type { RoleBinding as RoleBindingEntity } from '../entities'

export default class RoleBinding extends BaseStructure {
  public readonly guild: Guild
  public id!: number
  public roleId!: string
  public robloxGroupId!: number
  public min!: number
  public max!: number | null

  public constructor (client: Client, data: RoleBindingEntity, guild: Guild) {
    super(client)

    this.guild = guild

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
    return this.guild.roles.cache.get(this.roleId) ?? null
  }

  public async delete (): Promise<void> {
    return await this.guild.roleBindings.delete(this)
  }
}
