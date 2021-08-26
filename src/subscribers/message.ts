import { Channel, Message } from '../entities'
import type { EntitySubscriberInterface, InsertEvent } from 'typeorm'
import { EventSubscriber } from 'typeorm'

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  public listenTo (): Function {
    return Message
  }

  public async beforeInsert (event: InsertEvent<Message>): Promise<void> {
    const channelRepository = event.manager.getRepository(Channel)
    const entity = channelRepository.create({ id: event.entity.channelId, guildId: event.entity.guildId })
    if (typeof await channelRepository.findOne(entity) === 'undefined') {
      await channelRepository.save(entity)
    }
  }
}
