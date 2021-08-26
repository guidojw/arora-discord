import type { Guild, GuildMemberResolvable, MessageReaction, Snowflake, User } from 'discord.js'
import { GuildEmoji, MessageEmbed, TextChannel } from 'discord.js'
import BaseManager from './base'
import type { Repository } from 'typeorm'
import { Ticket } from '../structures'
import type { Ticket as TicketEntity } from '../entities'
import type { TicketTypeResolvable } from './guild-ticket-type'
import type { TicketUpdateOptions } from '../structures'
import { constants } from '../util'
import container from '../configs/container'
import getDecorators from 'inversify-inject-decorators'

export type TextChannelResolvable = TextChannel | Snowflake
export type TicketResolvable = TextChannelResolvable | GuildMemberResolvable | Ticket | number

const { TYPES } = constants
const { lazyInject } = getDecorators(container)

const TICKETS_INTERVAL = 60 * 1000
const SUBMISSION_TIME = 30 * 60 * 1000

export default class GuildTicketManager extends BaseManager<Ticket, TicketResolvable> {
  @lazyInject(TYPES.TicketRepository)
  private readonly ticketRepository!: Repository<TicketEntity>

  public readonly guild: Guild
  public readonly debounces: Map<string, true>

  public constructor (guild: Guild, iterable?: Iterable<TicketEntity>) {
    // @ts-expect-error
    super(guild.client, iterable, Ticket)

    this.guild = guild

    this.debounces = new Map()
  }

  public override add (data: TicketEntity, cache = true): Ticket {
    return super.add(data, cache, { id: data.id, extras: [this.guild] })
  }

  public async create ({ author: authorResolvable, ticketType: ticketTypeResolvable }: {
    author: GuildMemberResolvable
    ticketType: TicketTypeResolvable
  }): Promise<Ticket> {
    const author = this.guild.members.resolve(authorResolvable)
    if (author === null) {
      throw new Error('Invalid author.')
    }
    const ticketType = this.guild.ticketTypes.resolve(ticketTypeResolvable)
    if (ticketType === null) {
      throw new Error('Invalid ticket type.')
    }

    const channelName = `${ticketType.name}-${author.user.tag}`
    let channel
    try {
      channel = await this.guild.channels.create(channelName, { parent: this.guild.ticketsCategory ?? undefined })
      await channel.updateOverwrite(author, { VIEW_CHANNEL: true })
    } catch (err) {
      await channel?.delete()
      throw err
    }

    const newData = await this.ticketRepository.save(this.ticketRepository.create({
      guildId: this.guild.id,
      channelId: channel.id,
      typeId: ticketType.id
    }), {
      data: { userId: author.id }
    })
    const ticket = this.add(newData)

    await this.guild.log(
      author.user,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `${ticket.author?.toString() ?? 'Unknown'} **opened ticket** \`${ticket.id}\` **in** ${ticket.channel.toString()}`,
      { footer: `Ticket ID: ${ticket.id}` }
    )

    return ticket
  }

  public async delete (ticket: TicketResolvable): Promise<void> {
    const id = this.resolveID(ticket)
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
    const id = this.resolveID(ticket)
    if (id === null) {
      throw new Error('Invalid ticket.')
    }
    if (!this.cache.has(id)) {
      throw new Error('Ticket not found.')
    }

    const changes: Partial<TicketEntity> = {}
    if (typeof data.channel !== 'undefined') {
      const channel = this.guild.channels.resolve(data.channel)
      if (channel === null || !(channel instanceof TextChannel)) {
        throw new Error('Invalid channel.')
      }
      changes.channelId = channel.id
    }

    const newData = await this.ticketRepository.save(this.ticketRepository.create({
      id,
      ...changes
    }))

    const _ticket = this.cache.get(id)
    _ticket?.setup(newData)
    return _ticket ?? this.add(newData, false)
  }

  public async onMessageReactionAdd (reaction: MessageReaction, user: User): Promise<void> {
    const ticketType = this.guild.ticketTypes.cache.find(ticketType => (
      ticketType.message?.id === reaction.message.id && ticketType.emoji !== null &&
      (reaction.emoji instanceof GuildEmoji
        ? ticketType.emoji instanceof GuildEmoji && reaction.emoji.id === ticketType.emojiId
        : !(ticketType.emoji instanceof GuildEmoji) && reaction.emoji.name === ticketType.emojiId)
    ))
    if (typeof ticketType !== 'undefined') {
      await reaction.users.remove(user)

      if (!this.debounces.has(user.id)) {
        this.debounces.set(user.id, true)
        this.client.setTimeout(this.debounces.delete.bind(this.debounces, user.id), TICKETS_INTERVAL)

        if (this.resolve(user) === null) {
          if (!this.guild.supportEnabled) {
            const embed = new MessageEmbed()
              .setColor(0xff0000)
              .setAuthor(this.client.user?.username ?? 'Arora', this.client.user?.displayAvatarURL())
              .setTitle(`Welcome to ${this.guild.name} Support`)
              .setDescription(`We are currently closed. Check the ${this.guild.name} server for more information.`)
            await this.client.send(user, embed)
            return
          }

          const ticket = await this.create({ author: user, ticketType })
          await ticket.populateChannel()
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          ticket.timeout = this.client.setTimeout(ticket.close.bind(ticket, 'Timeout: ticket closed'), SUBMISSION_TIME)
        } else {
          const embed = new MessageEmbed()
            .setColor(0xff0000)
            .setTitle('Couldn\'t make ticket')
            .setDescription('You already have an open ticket.')
          await this.client.send(user, embed)
        }
      }
    }
  }

  public override resolve (ticketResolvable: TicketResolvable): Ticket | null {
    if (typeof ticketResolvable === 'number' || ticketResolvable instanceof Ticket) {
      return super.resolve(ticketResolvable)
    }
    if (typeof ticketResolvable === 'string' || ticketResolvable instanceof TextChannel) {
      const channel = this.guild.channels.resolve(ticketResolvable)
      if (channel !== null) {
        return this.cache.find(ticket => ticket.channelId === channel.id) ?? null
      }
      if (ticketResolvable instanceof TextChannel) {
        return null
      }
    }
    const member = this.guild.members.resolve(ticketResolvable)
    if (member !== null) {
      return this.cache.find(ticket => ticket.authorId === member.id) ?? null
    }
    return null
  }

  public override resolveID (ticketResolvable: TicketResolvable): number | null {
    if (typeof ticketResolvable === 'number' || ticketResolvable instanceof Ticket) {
      return super.resolve(ticketResolvable)?.id ?? null
    }
    if (typeof ticketResolvable === 'string' || ticketResolvable instanceof TextChannel) {
      const channel = this.guild.channels.resolve(ticketResolvable)
      if (channel !== null) {
        return this.cache.find(ticket => ticket.channelId === channel.id)?.id ?? null
      }
      if (ticketResolvable instanceof TextChannel) {
        return null
      }
    }
    const member = this.guild.members.resolve(ticketResolvable)
    if (member !== null) {
      return this.cache.find(ticket => ticket.authorId === member.id)?.id ?? null
    }
    return null
  }
}
