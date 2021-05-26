import { Guild, Role } from 'discord.js'
import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'

export default class RoleBinding implements BaseStructure {
  readonly client: CommandoClient
  readonly guild: Guild
  id!: string
  roleId!: string
  robloxGroupId!: number
  min!: number
  max!: number | null

  constructor (client: CommandoClient, data: any, guild: Guild) {
    this.client = client
    this.guild = guild

    this.setup(data)
  }

  setup (data: any): void {
    this.id = data.id
    this.roleId = data.roleId
    this.robloxGroupId = data.robloxGroupId
    this.min = data.min
    this.max = data.max
  }

  get role (): Role | null {
    return this.guild.roles.cache.get(this.roleId) ?? null
  }

  delete (): void {
    return this.guild.roleBindings.delete(this)
  }
}
