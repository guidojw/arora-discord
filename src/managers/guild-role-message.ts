import { type EmojiResolvable, GuildEmoji, type Message, type RoleResolvable } from 'discord.js'
import { type GuildContext, RoleMessage } from '../structures'
import { inject, injectable } from 'inversify'
import type { AroraClient } from '../client'
import { DataManager } from './base'
import type { Repository } from 'typeorm'
import type { RoleMessage as RoleMessageEntity } from '../entities'
import { constants } from '../utils'
import emojiRegex from 'emoji-regex'

const { TYPES } = constants

export type RoleMessageResolvable = RoleMessage | number

@injectable()
export default class GuildRoleMessageManager extends DataManager<
number,
RoleMessage,
RoleMessageResolvable,
RoleMessageEntity
> {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.RoleMessageRepository)
  private readonly roleMessageRepository!: Repository<RoleMessageEntity>

  public context!: GuildContext

  public constructor () {
    super(RoleMessage)
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: RoleMessageEntity): RoleMessage {
    return super.add(data, { id: data.id, extras: [this.context] })
  }

  public async create ({ role: roleResolvable, message, emoji: emojiResolvable }: {
    role: RoleResolvable
    message: Message
    emoji: EmojiResolvable
  }): Promise<RoleMessage> {
    const role = this.context.guild.roles.resolve(roleResolvable)
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
      const valid = new RegExp(`^(?:${emojiRegex().source})$`).test(emojiResolvable)
      emoji = valid ? emojiResolvable : null
    } else {
      emoji = this.context.guild.emojis.resolve(emojiResolvable)
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
    const id = (await this.roleMessageRepository.save(this.roleMessageRepository.create({
      roleId: role.id,
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null,
      guildId: this.context.id
    }), {
      data: { channelId: message.channel.id }
    })).id
    const newData = await this.roleMessageRepository.findOne(
      id,
      { relations: ['message'] }
    ) as RoleMessageEntity

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
      await roleMessage.message.reactions.resolve(roleMessage.emojiId)?.users.remove(this.client.user)
    }

    await this.roleMessageRepository.delete(roleMessage.id)
    this.cache.delete(roleMessage.id)
  }
}
