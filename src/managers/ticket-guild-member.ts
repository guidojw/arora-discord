import type { Client, Guild, GuildMember, GuildMemberResolvable, Snowflake } from 'discord.js'
import { Collection, Constants } from 'discord.js'
import type { Member as MemberEntity, Ticket as TicketEntity } from '../entities'
import type { Repository } from 'typeorm'
import { Ticket } from '../structures'
import { constants } from '../util'
import { inject } from 'inversify'

const { PartialTypes } = Constants
const { TYPES } = constants

export default class TicketGuildMemberManager {
  @inject(TYPES.MemberRepository) private readonly memberRepository!: Repository<MemberEntity>
  @inject(TYPES.TicketRepository) private readonly ticketRepository!: Repository<TicketEntity>

  public readonly ticket: Ticket
  public readonly client: Client
  public readonly guild: Guild

  public constructor (ticket: Ticket) {
    this.ticket = ticket
    this.client = ticket.client
    this.guild = ticket.guild
  }

  public get cache (): Collection<Snowflake, GuildMember> {
    const cache: Collection<string, GuildMember> = new Collection()
    for (const moderatorId of this.ticket._moderators) {
      const member = this.guild.members.resolve(moderatorId) ??
        (this.client.options.partials?.includes(PartialTypes.GUILD_MEMBER) === true
          ? this.guild.members.add({ user: { id: moderatorId } })
          : null)
      if (member !== null) {
        cache.set(moderatorId, member)
      }
    }
    return cache
  }

  public async add (memberResolvable: GuildMemberResolvable): Promise<Ticket> {
    const member = this.guild.members.resolve(memberResolvable)
    if (member === null) {
      throw new Error('Invalid member.')
    }
    if (this.cache.has(member.id)) {
      throw new Error('Ticket already contains moderator.')
    }

    const memberFields = { userId: member.id, guildId: this.guild.id }
    const memberData = await this.memberRepository.findOne(
      memberFields,
      { relations: ['moderatingTickets', 'roles'] }
    ) ?? await this.memberRepository.save(this.memberRepository.create(memberFields))
    const ticket = await this.ticketRepository.findOne(this.ticket.id) as TicketEntity
    if (typeof memberData.moderatingTickets === 'undefined') {
      memberData.moderatingTickets = []
    }
    memberData.moderatingTickets.push(ticket)
    await this.memberRepository.save(memberData)
    this.ticket._moderators.push(member.id)

    return this.ticket
  }
}
