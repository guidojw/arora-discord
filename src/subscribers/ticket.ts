import type { EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm'
import { Member, Ticket } from '../entities'
import type { Channel } from '../entities'
import { EventSubscriber } from 'typeorm'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class TicketSubscriber implements EntitySubscriberInterface<Ticket> {
  @inject(TYPES.ChannelRepository) private readonly channelRepository!: Repository<Channel>
  @inject(TYPES.MemberRepository) private readonly memberRepository!: Repository<Member>

  public listenTo (): Function {
    return Ticket
  }

  public async beforeInsert (event: InsertEvent<Ticket>): Promise<void> {
    const memberEntity = this.memberRepository.create({
      userId: event.queryRunner.data.userId,
      guildId: event.entity.guildId
    })
    const member = await this.memberRepository.findOne(memberEntity) ?? await this.memberRepository.save(memberEntity)
    if (!(member instanceof Member)) {
      return
    }

    // Map to own IDs instead of Discord's snowflake IDs. This is necessary because the id is the primary key and
    // since Discord member IDs are Discord user IDs and thus if a user is in two servers, the members table would
    // have two rows with the same ID row (which of course it can't because the ID is the primary key).
    event.entity.authorId = member.id

    const channelEntity = this.channelRepository.create({ id: event.entity.channelId, guildId: event.entity.guildId })
    if (typeof await this.channelRepository.findOne(channelEntity) === 'undefined') {
      await this.channelRepository.save(channelEntity)
    }
  }
}
