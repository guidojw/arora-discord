import { type EntitySubscriberInterface, EventSubscriber, type UpdateEvent } from 'typeorm'
import { Message, Panel } from '../entities'

@EventSubscriber()
export class PanelSubscriber implements EntitySubscriberInterface<Panel> {
  public listenTo (): Function {
    return Panel
  }

  public async beforeUpdate (event: UpdateEvent<Panel>): Promise<void> {
    if (typeof event.entity === 'undefined') {
      return
    }

    const messageRepository = event.manager.getRepository(Message)
    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      if (await messageRepository.findOneBy({ id: event.entity.messageId }) === null) {
        await messageRepository.save(messageRepository.create({
          id: event.entity.messageId,
          channelId: event.queryRunner.data.channelId,
          guildId: event.queryRunner.data.guildId
        }))
      }
    }
  }
}
