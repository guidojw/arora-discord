import type { EmojiResolvable, Guild, Message } from 'discord.js'
import BaseManager from './base'
import type { CommandoClient } from 'discord.js-commando'
import { GuildEmoji } from 'discord.js'
import type { Repository } from 'typeorm'
import { TicketType } from '../structures'
import type { TicketType as TicketTypeEntity } from '../entities'
import type { TicketTypeUpdateOptions } from '../structures'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type TicketTypeResolvable = TicketType | string

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

export default class GuildTicketTypeManager extends BaseManager<TicketType, TicketTypeResolvable> {
  @lazyInject(TYPES.TicketTypeRepository)
  private readonly ticketTypeRepository!: Repository<TicketTypeEntity>

  public readonly guild: Guild

  public constructor (guild: Guild, iterable?: Iterable<TicketType>) {
    // @ts-expect-error
    super(guild.client, iterable, TicketType)

    this.guild = guild
  }

  public override add (data: TicketTypeEntity, cache = true): TicketType {
    return super.add(data, cache, { id: data.id, extras: [this.guild] })
  }

  public async create (name: string): Promise<TicketType> {
    name = name.toLowerCase()
    if (this.resolve(name) !== null) {
      throw new Error('A ticket type with that name already exists.')
    }

    const newData = await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      name,
      guildId: this.guild.id
    }))

    return this.add(newData)
  }

  public async delete (ticketTypeResolvable: TicketTypeResolvable): Promise<void> {
    const ticketType = this.resolve(ticketTypeResolvable)
    if (ticketType === null) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(ticketType.id)) {
      throw new Error('Ticket type not found.')
    }

    if (ticketType.emoji !== null && ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.reactions.resolve(ticketType.emojiId)?.users.remove(this.client.user ?? undefined)
    }

    await this.ticketTypeRepository.delete(ticketType.id)
    this.cache.delete(ticketType.id)
  }

  public async update (
    ticketTypeResolvable: TicketTypeResolvable,
    data: TicketTypeUpdateOptions
  ): Promise<TicketType> {
    const id = this.resolveID(ticketTypeResolvable)
    if (id === null) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket type not found.')
    }

    const changes: Partial<TicketTypeEntity> = {}
    if (typeof data.name !== 'undefined') {
      if (this.resolve(data.name) !== null) {
        throw new Error('A ticket type with that name already exists.')
      }
      changes.name = data.name.toLowerCase()
    }

    const newData = await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id,
      ...changes
    }))

    const _ticketType = this.cache.get(id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData, false)
  }

  public async link (
    ticketTypeResolvable: TicketTypeResolvable,
    message: Message,
    emojiResolvable: EmojiResolvable
  ): Promise<TicketType> {
    const ticketType = this.resolve(ticketTypeResolvable)
    if (ticketType === null) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(ticketType.id)) {
      throw new Error('Ticket type not found.')
    }
    try {
      if (message.partial) {
        await message.fetch()
      }
    } catch {
      throw new Error('Invalid message.')
    }
    let emoji
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

    if (ticketType.emoji !== null && ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.reactions.resolve(ticketType.emojiId)?.users.remove(this.client.user ?? undefined)
    }
    await message.react(emoji)
    const newData = await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id: ticketType.id,
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null
    }), {
      data: { channelId: message.channel.id }
    })

    const _ticketType = this.cache.get(ticketType.id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData, false)
  }

  public async unlink (ticketTypeResolvable: TicketTypeResolvable): Promise<TicketType> {
    const ticketType = this.resolve(ticketTypeResolvable)
    if (ticketType === null) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(ticketType.id)) {
      throw new Error('Ticket type not found.')
    }

    if (ticketType.emoji !== null && ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.reactions.resolve(ticketType.emojiId)?.users.remove(this.client.user ?? undefined)
    }
    const newData = await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id: ticketType.id,
      messageId: null,
      emojiId: null,
      emoji: null
    }))

    const _ticketType = this.cache.get(ticketType.id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData, false)
  }

  public override resolve (type: TicketTypeResolvable): TicketType | null {
    if (typeof type === 'string') {
      type = type.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherType => (
        otherType.name.toLowerCase().replace(/\s/g, '') === type
      )) ?? null
    }
    return super.resolve(type)
  }

  public override resolveID (type: TicketTypeResolvable): number | null {
    if (typeof type === 'string') {
      type = type.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherType => (
        otherType.name.toLowerCase().replace(/\s/g, '') === type
      ))?.id ?? null
    }
    return super.resolveID(type)
  }
}
