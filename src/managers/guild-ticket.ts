import {
  type ButtonInteraction,
  EmbedBuilder,
  type GuildMemberResolvable,
  PermissionFlagsBits,
  TextChannel,
  type TextChannelResolvable
} from 'discord.js'
import { type GuildContext, Ticket, type TicketUpdateOptions } from '../structures'
import { inject, injectable } from 'inversify'
import { DataManager } from './base'
import { Repository } from 'typeorm'
import type { Ticket as TicketEntity } from '../entities'
import type { TicketTypeResolvable } from './guild-ticket-type'
import { constants } from '../utils'

const { TYPES } = constants

const TICKETS_INTERVAL = 3_000
const SUBMISSION_TIME = 3_600_000

export type TicketResolvable = TextChannelResolvable | GuildMemberResolvable | Ticket | number

@injectable()
export default class GuildTicketManager extends DataManager<number, Ticket, TicketResolvable, TicketEntity> {
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
    const permissionOverwrites = this.context.ticketsCategory?.permissionOverwrites.cache.toJSON() ?? []
    let channel
    try {
      channel = await this.context.guild.channels.create({
        name: channelName,
        parent: this.context.ticketsCategory ?? undefined,
        permissionOverwrites: [...permissionOverwrites, {
          id: author.id,
          allow: [PermissionFlagsBits.ViewChannel]
        }]
      })
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

  public async onButtonInteraction (interaction: ButtonInteraction): Promise<void> {
    const match = interaction.customId.match(/^ticket_type:([0-9]+)$/)
    if (match !== null) {
      const ticketType = this.context.ticketTypes.resolve(parseInt(match[1]))
      if (ticketType !== null) {
        const user = interaction.user
        if (!this.debounces.has(user.id)) {
          this.debounces.set(user.id, true)
          setTimeout(this.debounces.delete.bind(this.debounces, user.id), TICKETS_INTERVAL).unref()

          if (this.resolve(user) === null) {
            await interaction.deferReply({ ephemeral: true })

            const ticket = await this.create({ author: user, ticketType })
            await ticket.populateChannel()
            ticket.timeout = setTimeout(() => {
              ticket.close('Timeout: ticket closed', false).catch(console.error)
            }, SUBMISSION_TIME).unref()

            const embed = new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle('Successfully opened ticket.')
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              .setDescription(`You can visit it in ${ticket.channel.toString()}.`)
            await interaction.editReply({ embeds: [embed] })
          } else {
            const embed = new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('Couldn\'t make ticket')
              .setDescription('You already have an open ticket.')
            await interaction.reply({ embeds: [embed], ephemeral: true })
          }
        } else {
          const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Please wait a few seconds')
            .setDescription('before trying to open a new ticket.')
          await interaction.reply({ embeds: [embed], ephemeral: true })
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
