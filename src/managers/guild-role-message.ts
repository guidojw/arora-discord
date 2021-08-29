import type { EmojiResolvable, Guild, Message, RoleResolvable } from 'discord.js'
import BaseManager from './base'
import type { CommandoClient } from 'discord.js-commando'
import { GuildEmoji } from 'discord.js'
import type { Repository } from 'typeorm'
import { RoleMessage } from '../structures'
import type { RoleMessage as RoleMessageEntity } from '../entities'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type RoleMessageResolvable = RoleMessage | number

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GuildRoleMessageManager extends BaseManager<RoleMessage, RoleMessageResolvable> {
  @lazyInject(TYPES.RoleMessageRepository)
  private readonly roleMessageRepository!: Repository<RoleMessageEntity>

  public readonly guild: Guild

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
    const id = (await this.roleMessageRepository.save(this.roleMessageRepository.create({
      roleId: role.id,
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null,
      guildId: this.guild.id
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
      await roleMessage.message.reactions.resolve(roleMessage.emojiId)?.users.remove(this.client.user ?? undefined)
    }

    await this.roleMessageRepository.delete(roleMessage.id)
    this.cache.delete(roleMessage.id)
  }
}
