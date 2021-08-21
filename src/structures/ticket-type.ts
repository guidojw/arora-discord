import type { Client, Guild, GuildEmoji, Message } from 'discord.js'
import BaseStructure from './base'
import Postable from './mixins/postable'
import type { TicketType as TicketTypeEntity } from '../entities'

export default class TicketType extends Postable(BaseStructure) {
  public guild: Guild
  public id!: number
  public name!: string
  public messageId!: string | null
  public channelId!: string | null

  private _emoji!: string | null
  private _emojiId!: string | null

  public constructor (client: Client, data: TicketTypeEntity, guild: Guild) {
    super(client)

    this.guild = guild

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
      ? this.guild.emojis.cache.get(this._emojiId) ?? null
      : this._emoji
  }

  public get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  public async update (data: Partial<TicketTypeEntity>): Promise<TicketType> {
    return await this.guild.ticketTypes.update(this, data)
  }

  public async delete (): Promise<void> {
    return await this.guild.ticketTypes.delete(this)
  }

  public async link (message: Message, emoji: GuildEmoji): Promise<TicketType> {
    return await this.guild.ticketTypes.link(this, message, emoji)
  }

  public override toString (): string {
    return this.name
  }
}
