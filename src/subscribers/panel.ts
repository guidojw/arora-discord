import type { EntitySubscriberInterface, UpdateEvent } from 'typeorm'
import { Message, Panel } from '../entities'
import { EventSubscriber } from 'typeorm'

@EventSubscriber()
export class PanelSubscriber implements EntitySubscriberInterface<Panel> {
  public listenTo (): Function {
    return Panel
  }

  public async beforeUpdate (event: UpdateEvent<Panel>): Promise<void> {
    const messageRepository = event.manager.getRepository(Message)
    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const entity = messageRepository.create({
        id: event.entity.messageId,
        guildId: event.entity.guildId,
        channelId: event.queryRunner.data.channelId
      })
      if (typeof await messageRepository.findOne(entity) === 'undefined') {
        await messageRepository.save(entity)
      }
    }
  }
}
