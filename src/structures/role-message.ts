import type { GuildEmoji, Role } from 'discord.js'
import type { AbstractConstructor } from '../utils/util'
import BaseStructure from './base'
import type GuildContext from './guild-context'
import Postable from './mixins/postable'
import type { RoleMessage as RoleMessageEntity } from '../entities'
import { injectable } from 'inversify'

@injectable()
export default class RoleMessage extends Postable<
AbstractConstructor<BaseStructure<RoleMessageEntity>>,
RoleMessageEntity
>(BaseStructure) {
  public context!: GuildContext

  public id!: number
  public roleId!: string
  public messageId!: string | null
  public channelId!: string | null

  private _emoji!: string | null
  private _emojiId!: string | null

  public setOptions (data: RoleMessageEntity, context: GuildContext): void {
    this.context = context

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
      ? this.context.guild.emojis.cache.get(this._emojiId) ?? null
      : this._emoji
  }

  public get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  public get role (): Role | null {
    return this.context.guild.roles.cache.get(this.roleId) ?? null
  }

  public async delete (): Promise<void> {
    return await this.context.roleMessages.delete(this)
  }
}
