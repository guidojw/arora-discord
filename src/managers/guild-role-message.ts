import type { EmojiResolvable, Guild, Message, RoleResolvable } from 'discord.js'
import { inject, injectable } from 'inversify'
import BaseManager from './base'
import type { CommandoClient } from 'discord.js-commando'
import { GuildEmoji } from 'discord.js'
import type { Repository } from 'typeorm'
import { RoleMessage } from '../structures'
import type { RoleMessage as RoleMessageEntity } from '../entities'
import { constants } from '../util'

export type RoleMessageResolvable = RoleMessage | number

const { TYPES } = constants

@injectable()
export default class GuildRoleMessageManager extends BaseManager<RoleMessage, RoleMessageResolvable> {
  @inject(TYPES.RoleMessageRepository) private readonly roleMessageRepository!: Repository<RoleMessageEntity>

  public guild: Guild

  public constructor (guild: Guild, iterable?: Iterable<RoleMessageEntity>) {
    // @ts-expect-error
    super(guild.client, iterable, RoleMessage)

    this.guild = guild
  }

  public override add (data: RoleMessageEntity, cache = true): RoleMessage {
    return super.add(data, cache, { id: data.id, extras: [this.guild] })
  }

  public async create ({ role: roleResolvable, message, emoji: emojiResolvable }: {
    role: RoleResolvable
    message: Message
    emoji: EmojiResolvable
  }): Promise<RoleMessage> {
    const role = this.guild.roles.resolve(roleResolvable)
    if (role === null) {
      throw new Error('Invalid role.')
    }
    try {
      if (message.partial) {
        await message.fetch()
      }
    } catch {
      throw new Error('Invalid message.')
    }
    let emoji: string | GuildEmoji | null
    if (typeof emojiResolvable === 'string') {
      const valid = await (this.client as CommandoClient).registry.types.get('default-emoji')
        // @ts-expect-error
        ?.validate(emojiResolvable, null, {})
      emoji = valid !== true ? null : emojiResolvable
    } else {
      emoji = this.guild.emojis.resolve(emojiResolvable)
    }
    if (emoji === null) {
      throw new Error('Invalid emoji.')
    }
    if (this.cache.some(roleMessage => (
      roleMessage.roleId === role.id && roleMessage.messageId === message.id && (emoji instanceof GuildEmoji
        ? roleMessage.emoji instanceof GuildEmoji && emoji.id === roleMessage.emojiId
        : !(roleMessage.emoji instanceof GuildEmoji) && emoji === roleMessage.emojiId)
    ))) {
      throw new Error('A role message with that role, message and emoji already exists.')
    }

    await message.react(emoji)
    const newData = await this.roleMessageRepository.save(this.roleMessageRepository.create({
      roleId: role.id,
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null,
      guildId: this.guild.id
    }), {
      data: { channelId: message.channel.id}
    })

    return this.add(newData)
  }

  public async delete (roleMessageResolvable: RoleMessageResolvable): Promise<void> {
    const roleMessage = this.resolve(roleMessageResolvable)
    if (roleMessage === null) {
      throw new Error('Invalid role message.')
    }
    if (!this.cache.has(roleMessage.id)) {
      throw new Error('Role message not found.')
    }

    if (roleMessage.emoji !== null && roleMessage.message !== null) {
      if (roleMessage.message.partial) {
        await roleMessage.message.fetch()
      }
      await roleMessage.message.reactions.resolve(roleMessage.emojiId)?.users.remove(this.client.user ?? undefined)
    }

    await this.roleMessageRepository.delete(roleMessage.id)
    this.cache.delete(roleMessage.id)
  }
}
