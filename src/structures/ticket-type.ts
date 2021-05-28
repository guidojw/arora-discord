import { Guild, GuildEmoji } from 'discord.js'
import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import Panel from './panel'
import Postable from './mixins/postable'

export default class TicketType extends Postable(BaseStructure) {
  guild: Guild
  id!: number
  name!: string
  _emoji!: string | null
  _emojiId!: string | null

  constructor (client: CommandoClient, data: any, guild: Guild) {
    super(client)

    this.guild = guild

    this.setup(data)
  }

  setup (data: any): void {
    super.setup(data)

    this.id = data.id
    this.name = data.name
    this._emoji = data.emoji
    this._emojiId = data.emojiId
  }

  get emoji (): GuildEmoji | string | null {
    return this._emojiId !== null ? this.guild.emojis.cache.get(this._emojiId) ?? null : this._emoji
  }

  get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  async update (data: any): Promise<this> {
    return this.guild.ticketTypes.update(this, data)
  }

  async delete (): Promise<void> {
    return this.guild.ticketTypes.delete(this)
  }

  async link (panel: Panel, emoji: GuildEmoji): Promise<this> {
    return this.guild.ticketTypes.link(this, panel, emoji)
  }
}
