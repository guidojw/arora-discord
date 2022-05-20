import { Channel, Member, Ticket } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'

@EventSubscriber()
export class TicketSubscriber implements EntitySubscriberInterface<Ticket> {
  public listenTo (): Function {
    return Ticket
  }

  public async beforeInsert (event: InsertEvent<Ticket>): Promise<void> {
    const memberRepository = event.manager.getRepository(Member)
    const member = await memberRepository.findOneBy({ id: event.queryRunner.data.userId }) ??
      await memberRepository.save(memberRepository.create({
        userId: event.queryRunner.data.userId,
        guildId: event.entity.guildId
      }))

    // Map to own IDs instead of Discord's snowflake IDs. This is necessary
    // because the id is the primary key and since Discord member IDs are
    // Discord user IDs and thus if a user is in two servers, the members table
    // would have two rows with the same ID row (which of course it can't
    // because the ID is the primary key).
    event.entity.authorId = member.id

    const channelRepository = event.manager.getRepository(Channel)
    if (await channelRepository.findOneBy({ id: event.entity.channelId }) === null) {
      await channelRepository.save(
        channelRepository.create({ id: event.entity.channelId, guildId: event.entity.guildId })
      )
    }
  }
}
