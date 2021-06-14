import { Guild, GuildEmoji } from 'discord.js'
import BaseStructure from './base'
import Client from '../client/client'
import Panel from './panel'
import Postable from './mixins/postable'

export default class TicketType extends Postable(BaseStructure) {
  public guild: Guild
  public id!: number
  public name!: string
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
    this.name = data.name
    this._emoji = data.emoji
    this._emojiId = data.emojiId
  }

  public get emoji (): GuildEmoji | string | null {
    return this._emojiId !== null
      ? this.guild.emojis.cache.get(this._emojiId) ?? null
      : this._emoji
  }

  public get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  public async update (data: any): Promise<this> {
    return this.guild.ticketTypes.update(this, data)
  }

  public async delete (): Promise<void> {
    return this.guild.ticketTypes.delete(this)
  }

  public async link (panel: Panel, emoji: GuildEmoji): Promise<this> {
    return this.guild.ticketTypes.link(this, panel, emoji)
  }
}
