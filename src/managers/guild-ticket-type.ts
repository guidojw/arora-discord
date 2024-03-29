import {
  type ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  type EmojiResolvable,
  type Message,
  type MessageActionRowComponent,
  type MessageActionRowComponentBuilder
} from 'discord.js'
import { type GuildContext, TicketType, type TicketTypeUpdateOptions } from '../structures'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import { Repository } from 'typeorm'
import type { TicketType as TicketTypeEntity } from '../entities'
import { constants } from '../utils'
import emojiRegex from 'emoji-regex'

const { TYPES } = constants

export type TicketTypeResolvable = string | TicketType | number

@injectable()
export default class GuildTicketTypeManager extends DataManager<
number,
TicketType,
TicketTypeResolvable,
TicketTypeEntity
> {
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

    if (ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.edit({
        components: filterOutComponentWithCustomId(ticketType.message.components, `ticket_type:${ticketType.id}`)
      })
    }

    await this.ticketTypeRepository.delete(ticketType.id)
    this.cache.delete(ticketType.id)
  }

  public async update (
    ticketTypeResolvable: TicketTypeResolvable,
    data: TicketTypeUpdateOptions
  ): Promise<TicketType> {
    const ticketType = this.resolve(ticketTypeResolvable)
    if (ticketType === null) {
      throw new Error('Invalid ticket type.')
    }
    if (!this.cache.has(ticketType.id)) {
      throw new Error('Ticket type not found.')
    }

    const changes: Partial<TicketTypeEntity> = {}
    if (typeof data.name !== 'undefined') {
      if (this.resolve(data.name) !== ticketType) {
        throw new Error('A ticket type with that name already exists.')
      }
      changes.name = data.name

      if (ticketType.message !== null) {
        if (ticketType.message.partial) {
          await ticketType.message.fetch()
        }
        await ticketType.message.edit({
          components: ticketType.message.components
            .map<ActionRowBuilder<MessageActionRowComponentBuilder>>(row => new ActionRowBuilder({
            ...row,
            components: row.components
              .map(component => {
                if (typeof data.name !== 'undefined' && component.type === ComponentType.Button &&
                  'custom_id' in component.data && component.data.custom_id === `ticket_type:${ticketType.id}`) {
                  return ButtonBuilder.from(component).setLabel(data.name)
                }
                return component
              })
          }))
        })
      }
    }

    await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      ...changes,
      id: ticketType.id
    }))
    const newData = await this.ticketTypeRepository.findOne({
      where: { id: ticketType.id },
      relations: { message: true }
    }) as TicketTypeEntity

    const _ticketType = this.cache.get(ticketType.id)
    _ticketType?.setup(newData)
    return _ticketType ?? this.add(newData)
  }

  public async link (
    ticketTypeResolvable: TicketTypeResolvable,
    message: Message,
    emojiResolvable: EmojiResolvable | null
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
    let emoji = null
    if (emojiResolvable !== null) {
      if (typeof emojiResolvable === 'string') {
        const valid = new RegExp(`^(?:${emojiRegex().source})$`).test(emojiResolvable)
        emoji = valid ? emojiResolvable : null
      } else {
        emoji = this.context.guild.emojis.resolve(emojiResolvable)
      }
    }

    if (ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.edit({
        components: filterOutComponentWithCustomId(ticketType.message.components, `ticket_type:${ticketType.id}`)
      })
    }
    const components = message.components
      .map<ActionRowBuilder<MessageActionRowComponentBuilder>>(row => ActionRowBuilder.from(row))
    let row = components.find(row => row.components.length < 5)
    if (typeof row === 'undefined') {
      row = new ActionRowBuilder()
      components.push(row)
    }
    const button = new ButtonBuilder()
      .setLabel(ticketType.name)
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`ticket_type:${ticketType.id}`)
      .setDisabled(!this.context.supportEnabled)
    if (emoji !== null) {
      button.setEmoji(emoji.toString())
    }
    row.addComponents(button)
    await message.edit({ components })
    await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id: ticketType.id,
      messageId: message.id
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

    if (ticketType.message !== null) {
      if (ticketType.message.partial) {
        await ticketType.message.fetch()
      }
      await ticketType.message.edit({
        components: filterOutComponentWithCustomId(ticketType.message.components, `ticket_type:${ticketType.id}`)
      })
    }
    await this.ticketTypeRepository.save(this.ticketTypeRepository.create({
      id: ticketType.id,
      messageId: null
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

function filterOutComponentWithCustomId (
  components: Array<ActionRow<MessageActionRowComponent>>,
  customId: string
): Array<ActionRowBuilder<MessageActionRowComponentBuilder>> {
  return components
    .map<ActionRowBuilder<MessageActionRowComponentBuilder>>(row => ActionRowBuilder.from(row))
    .map(row => {
      row.setComponents(row.components.filter(component => (
        'custom_id' in component && component.custom_id !== customId)
      ))
      return row
    })
    .filter(row => row.components.length !== 0)
}
