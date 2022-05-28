import { Channel, Message } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  public listenTo (): Function {
    return Message
  }

  public async beforeInsert (event: InsertEvent<Message>): Promise<void> {
    const channelRepository = event.manager.getRepository(Channel)
    const fields = { id: event.entity.channelId, guildId: event.entity.guildId }
    if (await channelRepository.findOneBy(fields) === null) {
      await channelRepository.save(channelRepository.create(fields))
    }
  }
}
