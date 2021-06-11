import { Guild, GuildEmoji, Role } from 'discord.js'
import BaseStructure from './base'
import Client from '../client/client'
import Postable from './mixins/postable'

export default class RoleMessage extends Postable(BaseStructure) {
  public readonly guild: Guild
  public id!: number
  public roleId!: string

  private _emoji!: string | null
  private _emojiId!: string | null

  public constructor (client: Client, data: any, guild: Guild) {
    super(client)

    this.guild = guild

    this.setup(data)
  }

  public setup (data: any): void {
    super.setup(data)

    this.id = data.id
    this.roleId = data.roleId
    this._emoji = data.emoji
    this._emojiId = data.emojiId
  }

  public get emoji (): GuildEmoji | string | null {
    return this._emojiId !== null ? this.guild.emojis.cache.get(this._emojiId) ?? null : this._emoji
  }

  public get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  public get role (): Role | null {
    return this.guild.roles.cache.get(this.roleId) ?? null
  }

  public delete (): void {
    return this.guild.roleMessages.delete(this)
  }
}
