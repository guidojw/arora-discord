import { Emoji, Message, TicketType } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type UpdateEvent } from 'typeorm'

@EventSubscriber()
export class TicketTypeSubscriber implements EntitySubscriberInterface<TicketType> {
  public listenTo (): Function {
    return TicketType
  }

  public async beforeUpdate (event: UpdateEvent<TicketType>): Promise<void> {
    if (typeof event.entity === 'undefined') {
      return
    }

    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const messageRepository = event.manager.getRepository(Message)
      if (await messageRepository.findOneBy({ id: event.entity.messageId }) === null) {
        await messageRepository.save(messageRepository.create({
          id: event.entity.messageId,
          channelId: event.queryRunner.data.channelId,
          guildId: event.queryRunner.data.guildId
        }))
      }
    }

    if (event.updatedColumns.some(column => column.propertyName === 'emojiId') && event.entity.emojiId != null) {
      const emojiRepository = event.manager.getRepository(Emoji)
      if (await emojiRepository.findOneBy({ id: event.entity.emojiId }) === null) {
        await emojiRepository.save(emojiRepository.create({
          id: event.entity.emojiId,
          guildId: event.queryRunner.data.guildId
        }))
      }
    }
  }
}
