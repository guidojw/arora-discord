import { Emoji, Message, TicketType } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type UpdateEvent } from 'typeorm'
import type { Constructor } from '../utils'

@EventSubscriber()
export class TicketTypeSubscriber implements EntitySubscriberInterface<TicketType> {
  public listenTo (): Constructor {
    return TicketType
  }

  public async beforeUpdate (event: UpdateEvent<TicketType>): Promise<void> {
    if (typeof event.entity === 'undefined') {
      return
    }

    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const messageRepository = event.manager.getRepository(Message)
      const messageFields = {
        id: event.entity.messageId,
        channelId: event.queryRunner.data.channelId,
        guildId: event.queryRunner.data.guildId
      }
      if (await messageRepository.findOneBy(messageFields) === null) {
        await messageRepository.save(messageRepository.create(messageFields))
      }
    }

    if (event.updatedColumns.some(column => column.propertyName === 'emojiId') && event.entity.emojiId != null) {
      const emojiRepository = event.manager.getRepository(Emoji)
      const emojiFields = { id: event.entity.emojiId, guildId: event.queryRunner.data.guildId }
      if (await emojiRepository.findOneBy(emojiFields) === null) {
        await emojiRepository.save(emojiRepository.create(emojiFields))
      }
    }
  }
}
