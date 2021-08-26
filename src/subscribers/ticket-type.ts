import { Emoji, Message, TicketType } from '../entities'
import type { EntitySubscriberInterface, UpdateEvent } from 'typeorm'
import { EventSubscriber } from 'typeorm'

@EventSubscriber()
export class TicketTypeSubscriber implements EntitySubscriberInterface<TicketType> {
  public listenTo (): Function {
    return TicketType
  }

  public async beforeUpdate (event: UpdateEvent<TicketType>): Promise<void> {
    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const messageRepository = event.manager.getRepository(Message)
      const messageEntity = messageRepository.create({
        id: event.entity.messageId,
        channelId: event.queryRunner.data.channelId,
        guildId: event.entity.guildId
      })
      if (typeof await messageRepository.findOne(messageEntity) === 'undefined') {
        await messageRepository.save(messageEntity)
      }
    }

    if (event.updatedColumns.some(column => column.propertyName === 'emojiId') && event.entity.emojiId != null) {
      const emojiRepository = event.manager.getRepository(Emoji)
      const emojiEntity = emojiRepository.create({
        id: event.entity.emojiId,
        guildId: event.entity.guildId
      })
      if (typeof await emojiRepository.findOne(emojiEntity) === 'undefined') {
        await emojiRepository.save(emojiEntity)
      }
    }
  }
}
