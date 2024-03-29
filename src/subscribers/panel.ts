import { type EntitySubscriberInterface, EventSubscriber, type UpdateEvent } from 'typeorm'
import { Message, Panel } from '../entities'
import type { Constructor } from '../utils'

@EventSubscriber()
export class PanelSubscriber implements EntitySubscriberInterface<Panel> {
  public listenTo (): Constructor {
    return Panel
  }

  public async beforeUpdate (event: UpdateEvent<Panel>): Promise<void> {
    if (typeof event.entity === 'undefined') {
      return
    }

    const messageRepository = event.manager.getRepository(Message)
    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const fields = {
        id: event.entity.messageId,
        channelId: event.queryRunner.data.channelId,
        guildId: event.queryRunner.data.guildId
      }
      if (await messageRepository.findOneBy(fields) === null) {
        await messageRepository.save(messageRepository.create(fields))
      }
    }
  }
}
