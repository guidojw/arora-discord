import { Collection, Constants, type GuildMember, type GuildMemberResolvable, type Snowflake } from 'discord.js'
import type { GuildContext, Ticket } from '../structures'
import type { Member as MemberEntity, Ticket as TicketEntity } from '../entities'
import { inject, injectable } from 'inversify'
import type { AroraClient } from '../client'
import BaseManager from './base'
import type { Repository } from 'typeorm'
import { constants } from '../utils'

const { PartialTypes } = Constants
const { TYPES } = constants

@injectable()
export default class TicketGuildMemberManager extends BaseManager<string, GuildMember, GuildMemberResolvable> {
  @inject(TYPES.Client)
  private readonly client!: AroraClient<true>

  @inject(TYPES.MemberRepository)
  private readonly memberRepository!: Repository<MemberEntity>

  @inject(TYPES.TicketRepository)
  private readonly ticketRepository!: Repository<TicketEntity>

  public ticket!: Ticket
  public context!: GuildContext

  public override setOptions (ticket: Ticket): void {
    this.ticket = ticket
    this.context = ticket.context
  }

  public get cache (): Collection<Snowflake, GuildMember> {
    const cache: Collection<string, GuildMember> = new Collection()
    for (const moderatorId of this.ticket._moderators) {
      const member = this.context.guild.members.resolve(moderatorId) ??
        (this.client.options.partials?.includes(PartialTypes.GUILD_MEMBER) === true
          // @ts-expect-error
          ? this.context.guild.members._add({ user: { id: moderatorId } })
          : null)
      if (member !== null) {
        cache.set(moderatorId, member)
      }
    }
    return cache
  }

  public async add (memberResolvable: GuildMemberResolvable): Promise<Ticket> {
    const member = this.context.guild.members.resolve(memberResolvable)
    if (member === null) {
      throw new Error('Invalid member.')
    }
    if (this.cache.has(member.id)) {
      throw new Error('Ticket already contains moderator.')
    }

    const memberFields = { userId: member.id, guildId: this.context.id }
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
