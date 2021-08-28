import type { Client, Guild, GuildEmoji, Role } from 'discord.js'
import BaseStructure from './base'
import Postable from './mixins/postable'
import type { RoleMessage as RoleMessageEntity } from '../entities'

export default class RoleMessage extends Postable(BaseStructure) {
  public readonly guild: Guild
  public id!: number
  public roleId!: string
  public messageId!: string | null
  public channelId!: string | null

  private _emoji!: string | null
  private _emojiId!: string | null

  public constructor (client: Client, data: RoleMessageEntity, guild: Guild) {
    super(client)

    this.guild = guild

    this.setup(data)
  }

  public setup (data: RoleMessageEntity): void {
    this.id = data.id
    this.roleId = data.roleId
    this.messageId = data.message?.id ?? null
    this.channelId = data.message?.channelId ?? null
    this._emoji = data.emoji ?? null
    this._emojiId = data.emojiId ?? null
  }

  public get emoji (): GuildEmoji | string | null {
    return this._emojiId !== null
      ? this.guild.emojis.cache.get(this._emojiId) ?? null
      : this._emoji
  }

  public get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  public get role (): Role | null {
    return this.guild.roles.cache.get(this.roleId) ?? null
  }

  public async delete (): Promise<void> {
    return await this.guild.roleMessages.delete(this)
  }
}
