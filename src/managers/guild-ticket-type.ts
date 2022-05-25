import { type EmojiResolvable, GuildEmoji, type Message } from 'discord.js'
import { type GuildContext, TicketType, type TicketTypeUpdateOptions } from '../structures'
import { inject, injectable } from 'inversify'
import type { AroraClient } from '../client'
import { DataManager } from './base'
import type { Repository } from 'typeorm'
import type { TicketType as TicketTypeEntity } from '../entities'
import { constants } from '../utils'
import emojiRegex from 'emoji-regex'

const { TYPES } = constants

export type TicketTypeResolvable = TicketType | string

@injectable()
export default class GuildTicketTypeManager extends DataManager<
number,
TicketType,
TicketTypeResolvable,
TicketTypeEntity
> {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.TicketTypeRepository)
  private readonly ticketTypeRepository!: Repository<TicketTypeEntity>

  public context!: GuildContext

  public constructor () {
    super(TicketType)
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: TicketTypeEntity): TicketType {
    return super.add(data, { id: data.id, extras: [this.context] })
  }

  public async create (name: string): Promise<TicketType> {
    name = name.toLowerCase()
    if (this.resolve(name) !== null) {
      throw new Error('A ticket type with that name already exists.')
    }

    const newData = await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      name,
      guildId: this.context.id
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
      await ticketType.message.reactions.resolve(ticketType.emojiId)?.users.remove(this.client.user)
    }

    await this.ticketTypeRepository.delete(ticketType.id)
    this.cache.delete(ticketType.id)
  }

  public async update (
    ticketTypeResolvable: TicketTypeResolvable,
    data: TicketTypeUpdateOptions
  ): Promise<TicketType> {
    const id = this.resolveId(ticketTypeResolvable)
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

    await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      ...changes,
      id
    }))
    const newData = await this.ticketTypeRepository.findOne({
      where: { id },
      relations: { message: true }
    }) as TicketTypeEntity

    const _ticketType = this.cache.get(id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData)
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
      const valid = new RegExp(`^(?:${emojiRegex().source})$`).test(emojiResolvable)
      emoji = valid ? emojiResolvable : null
    } else {
      emoji = this.context.guild.emojis.resolve(emojiResolvable)
    }
    if (emoji === null) {
      throw new Error('Invalid emoji.')
    }

    if (ticketType.emoji !== null && ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.reactions.resolve(ticketType.emojiId)?.users.remove(this.client.user)
    }
    await message.react(emoji)
    await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id: ticketType.id,
      messageId: message.id,
      emojiId: emoji instanceof GuildEmoji ? emoji.id : null,
      emoji: !(emoji instanceof GuildEmoji) ? emoji : null
    }), {
      data: {
        channelId: message.channel.id,
        guildId: this.context.id
      }
    })
    const newData = await this.ticketTypeRepository.findOne({
      where: { id: ticketType.id },
      relations: { message: true }
    }) as TicketTypeEntity

    const _ticketType = this.cache.get(ticketType.id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData)
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
      await ticketType.message.reactions.resolve(ticketType.emojiId)?.users.remove(this.client.user)
    }
    await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id: ticketType.id,
      messageId: null,
      emojiId: null,
      emoji: null
    }))
    const newData = await this.ticketTypeRepository.findOneBy({ id: ticketType.id }) as TicketTypeEntity

    const _ticketType = this.cache.get(ticketType.id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData)
  }

  public override resolve (ticketType: TicketType): TicketType
  public override resolve (ticketType: TicketTypeResolvable): TicketType | null
  public override resolve (ticketType: TicketTypeResolvable): TicketType | null {
    if (typeof ticketType === 'string') {
      ticketType = ticketType.toLowerCase().replace(/\s/g, '')
      return this.cache.find(otherType => (
        otherType.name.toLowerCase().replace(/\s/g, '') === ticketType
      )) ?? null
    }
    return super.resolve(ticketType)
  }

  public override resolveId (ticketType: number): number
  public override resolveId (ticketType: TicketTypeResolvable): number | null
  public override resolveId (ticketType: number | TicketTypeResolvable): number | null {
    if (typeof ticketType === 'string') {
      return this.resolve(ticketType)?.id ?? null
    }
    return super.resolveId(ticketType)
  }
}
