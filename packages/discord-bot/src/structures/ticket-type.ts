import type { GuildEmoji, Message } from 'discord.js'
import type { AbstractConstructor } from '../utils'
import BaseStructure from './base'
import type { GuildContext } from '.'
import { Postable } from './mixins'
import type { TicketType as TicketTypeEntity } from '../entities'
import { injectable } from 'inversify'

export interface TicketTypeUpdateOptions { name?: string }

@injectable()
export default class TicketType extends Postable<
AbstractConstructor<BaseStructure<TicketTypeEntity>>,
TicketTypeEntity
>(BaseStructure) {
  public context!: GuildContext

  public id!: number
  public name!: string
  public messageId!: string | null
  public channelId!: string | null

  private _emoji!: string | null
  private _emojiId!: string | null

  public setOptions (data: TicketTypeEntity, context: GuildContext): void {
    this.context = context

    this.setup(data)
  }

  public setup (data: TicketTypeEntity): void {
    this.id = data.id
    this.name = data.name
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

  public async update (data: TicketTypeUpdateOptions): Promise<TicketType> {
    return await this.context.ticketTypes.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.context.ticketTypes.delete(this)
  }

  public async link (message: Message, emoji: GuildEmoji): Promise<TicketType> {
    return await this.context.ticketTypes.link(this, message, emoji)
  }

  public override toString (): string {
    return this.name
  }
}
