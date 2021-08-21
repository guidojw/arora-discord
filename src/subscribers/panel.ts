import type { EntitySubscriberInterface, Repository, UpdateEvent } from 'typeorm'
import type { Message, Panel } from '../entities'
import { EventSubscriber } from 'typeorm'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class PanelSubscriber implements EntitySubscriberInterface<Panel> {
  @inject(TYPES.MessageRepository) private readonly messageRepository!: Repository<Message>

  public async beforeUpdate (event: UpdateEvent<Panel>): Promise<void> {
    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const entity = this.messageRepository.create({
        id: event.entity.messageId,
        guildId: event.entity.guildId,
        channelId: event.queryRunner.data.channelId
      })
      if (typeof await this.messageRepository.findOne(entity) === 'undefined') {
        await this.messageRepository.save(entity)
      }
    }
  }
}
