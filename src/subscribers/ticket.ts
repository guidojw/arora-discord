import { Channel, Member, Ticket } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'
import type { Constructor } from '../utils'

@EventSubscriber()
export class TicketSubscriber implements EntitySubscriberInterface<Ticket> {
  public listenTo (): Constructor {
    return Ticket
  }

  public async beforeInsert (event: InsertEvent<Ticket>): Promise<void> {
    const memberRepository = event.manager.getRepository(Member)
    const memberFields = { userId: event.queryRunner.data.userId, guildId: event.entity.guildId }
    const member = await memberRepository.findOneBy(memberFields) ??
      await memberRepository.save(memberRepository.create(memberFields))

    // Map to own IDs instead of Discord's snowflake IDs. This is necessary
    // because the id is the primary key and since Discord member IDs are
    // Discord user IDs and thus if a user is in two servers, the members table
    // would have two rows with the same ID row (which of course it can't
    // because the ID is the primary key).
    event.entity.authorId = member.id

    const channelRepository = event.manager.getRepository(Channel)
    const channelFields = { id: event.entity.channelId, guildId: event.entity.guildId }
    if (await channelRepository.findOneBy(channelFields) === null) {
      await channelRepository.save(channelRepository.create(channelFields))
    }
  }
}
