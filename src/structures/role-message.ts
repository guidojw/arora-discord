import { Guild, GuildEmoji, Role } from 'discord.js'
import BaseStructure from './base'
import { CommandoClient } from 'discord.js-commando'
import Postable from './mixins/postable'

export default class RoleMessage extends Postable(BaseStructure) {
  guild: Guild
  id!: number
  roleId!: string
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
    this.roleId = data.roleId
    this._emoji = data.emoji
    this._emojiId = data.emojiId
  }

  get emoji (): GuildEmoji | string | null {
    return this._emojiId !== null ? this.guild.emojis.cache.get(this._emojiId) ?? null : this._emoji
  }

  get emojiId (): string {
    return (this._emoji ?? this._emojiId) as string
  }

  get role (): Role | null {
    return this.guild.roles.cache.get(this.roleId) ?? null
  }

  delete (): void {
    return this.guild.roleMessages.delete(this)
  }
}
