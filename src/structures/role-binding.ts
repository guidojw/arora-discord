import { Guild, Role } from 'discord.js'
import BaseStructure from './base'
import Client from '../client/client'

export default class RoleBinding extends BaseStructure {
  public readonly guild: Guild
  public id!: string
  public roleId!: string
  public robloxGroupId!: number
  public min!: number
  public max!: number | null

  public constructor (client: Client, data: any, guild: Guild) {
    super(client)

    this.guild = guild

    this.setup(data)
  }

  public setup (data: any): void {
    this.id = data.id
    this.roleId = data.roleId
    this.robloxGroupId = data.robloxGroupId
    this.min = data.min
    this.max = data.max
  }

  public get role (): Role | null {
    return this.guild.roles.cache.get(this.roleId) ?? null
  }

  public delete (): void {
    return this.guild.roleBindings.delete(this)
  }
}
