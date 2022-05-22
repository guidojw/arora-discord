import { type GuildContext, Ticket, type TicketUpdateOptions } from '../structures'
import {
  GuildEmoji,
  type GuildMemberResolvable,
  MessageEmbed,
  type MessageReaction,
  TextChannel,
  type TextChannelResolvable,
  type User
} from 'discord.js'
import { inject, injectable } from 'inversify'
import type { AroraClient } from '../client'
import { DataManager } from './base'
import type { Repository } from 'typeorm'
import type { Ticket as TicketEntity } from '../entities'
import type { TicketTypeResolvable } from './guild-ticket-type'
import { constants } from '../utils'

const { TYPES } = constants

const TICKETS_INTERVAL = 60_000
const SUBMISSION_TIME = 3_600_000

export type TicketResolvable = TextChannelResolvable | GuildMemberResolvable | Ticket | number

@injectable()
export default class GuildTicketManager extends DataManager<number, Ticket, TicketResolvable, TicketEntity> {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.TicketRepository)
  private readonly ticketRepository!: Repository<TicketEntity>

  public context!: GuildContext

  public readonly debounces: Map<string, true>

  public constructor () {
    super(Ticket)

    this.debounces = new Map()
  }

  public override setOptions (context: GuildContext): void {
    this.context = context
  }

  public override add (data: TicketEntity): Ticket {
    return super.add(data, { id: data.id, extras: [this.context] })
  }

  public async create ({ author: authorResolvable, ticketType: ticketTypeResolvable }: {
    author: GuildMemberResolvable
    ticketType: TicketTypeResolvable
  }): Promise<Ticket> {
    const author = this.context.guild.members.resolve(authorResolvable)
    if (author === null) {
      throw new Error('Invalid author.')
    }
    const ticketType = this.context.ticketTypes.resolve(ticketTypeResolvable)
    if (ticketType === null) {
      throw new Error('Invalid ticket type.')
    }

    const channelName = `${ticketType.name}-${author.user.tag}`
    let channel
    try {
      channel = await this.context.guild.channels.create(
        channelName,
        { parent: this.context.ticketsCategory ?? undefined }
      )
      await channel.permissionOverwrites.edit(author, { VIEW_CHANNEL: true })
    } catch (err) {
      await channel?.delete()
      throw err
    }

    const id = (await this.ticketRepository.save(this.ticketRepository.create({
      guildId: this.context.id,
      channelId: channel.id,
      typeId: ticketType.id
    }), {
      data: { userId: author.id }
    })).id
    const newData = await this.ticketRepository.findOne({
      where: { id },
      relations: { author: true }
    }) as TicketEntity
    const ticket = this.add(newData)

    await this.context.log(
      author.user,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `${ticket.author?.toString() ?? 'Unknown'} **opened ticket** \`${ticket.id}\` **in** ${ticket.channel.toString()}`,
      { footer: `Ticket ID: ${ticket.id}` }
    )

    return ticket
  }

  public async delete (ticket: TicketResolvable): Promise<void> {
    const id = this.resolveId(ticket)
    if (id === null) {
      throw new Error('Invalid ticket.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket not found.')
    }

    await this.ticketRepository.delete(id)
    this.cache.delete(id)
  }

  public async update (
    ticket: TicketResolvable,
    data: TicketUpdateOptions
  ): Promise<Ticket> {
    const id = this.resolveId(ticket)
    if (id === null) {
      throw new Error('Invalid ticket.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket not found.')
    }

    const changes: Partial<TicketEntity> = {}
    if (typeof data.channel !== 'undefined') {
      const channel = this.context.guild.channels.resolve(data.channel)
      if (channel === null || !(channel instanceof TextChannel)) {
        throw new Error('Invalid channel.')
      }
      changes.channelId = channel.id
    }

    await this.ticketRepository.save(this.ticketRepository.create({
      ...changes,
      id
    }))
    const newData = await this.ticketRepository.findOne({
      where: { id },
      relations: { author: true }
    }) as TicketEntity

    const _ticket = this.cache.get(id)
    _ticket?.setup(newData)
    return _ticket ?? this.add(newData)
  }

  public async onMessageReactionAdd (reaction: MessageReaction, user: User): Promise<void> {
    const ticketType = this.context.ticketTypes.cache.find(ticketType => (
      ticketType.message?.id === reaction.message.id && ticketType.emoji !== null &&
      (reaction.emoji instanceof GuildEmoji
        ? ticketType.emoji instanceof GuildEmoji && reaction.emoji.id === ticketType.emojiId
        : !(ticketType.emoji instanceof GuildEmoji) && reaction.emoji.name === ticketType.emojiId)
    ))
    if (typeof ticketType !== 'undefined') {
      await reaction.users.remove(user)

      if (!this.debounces.has(user.id)) {
        this.debounces.set(user.id, true)
        setTimeout(this.debounces.delete.bind(this.debounces, user.id), TICKETS_INTERVAL).unref()

        if (this.resolve(user) === null) {
          if (!this.context.supportEnabled) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setAuthor({ name: this.client.user.username, iconURL: this.client.user.displayAvatarURL() })
              .setTitle(`Welcome to ${this.context.guild.name} Support`)
              .setDescription(`We are currently closed. Check the ${this.context.guild.name} server for more information.`)
            await this.client.send(user, { embeds: [embed] })
            return
          }

          const ticket = await this.create({ author: user, ticketType })
          await ticket.populateChannel()
          ticket.timeout = setTimeout(() => {
            ticket.close('Timeout: ticket closed', false).catch(console.error)
          }, SUBMISSION_TIME).unref()
        } else {
          const embed = new MessageEmbed()
            .setColor(0xff0000)
            .setTitle('Couldn\'t make ticket')
            .setDescription('You already have an open ticket.')
          await this.client.send(user, { embeds: [embed] })
        }
      }
    }
  }

  public override resolve (ticket: Ticket): Ticket
  public override resolve (ticket: TicketResolvable): Ticket | null
  public override resolve (ticket: TicketResolvable): Ticket | null {
    if (typeof ticket === 'number' || ticket instanceof Ticket) {
      return super.resolve(ticket)
    }
    if (typeof ticket === 'string' || ticket instanceof TextChannel) {
      const channel = this.context.guild.channels.resolve(ticket)
      if (channel !== null) {
        return this.cache.find(otherTicket => otherTicket.channelId === channel.id) ?? null
      }
      if (ticket instanceof TextChannel) {
        return null
      }
    }
    const member = this.context.guild.members.resolve(ticket)
    if (member !== null) {
      return this.cache.find(otherTicket => otherTicket.authorId === member.id) ?? null
    }
    return null
  }

  public override resolveId (ticket: number): number
  public override resolveId (ticket: TicketResolvable): number | null
  public override resolveId (ticket: TicketResolvable): number | null {
    if (!(typeof ticket === 'number' || ticket instanceof Ticket)) {
      return this.resolve(ticket)?.id ?? null
    }
    return super.resolveId(ticket)
  }
}