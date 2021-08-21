import type { Emoji, Message } from '../entities'
import type { EntitySubscriberInterface, Repository, UpdateEvent } from 'typeorm'
import { EventSubscriber } from 'typeorm'
import { TicketType } from '../entities'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class TicketTypeSubscriber implements EntitySubscriberInterface<TicketType> {
  @inject(TYPES.EmojiRepository) private readonly emojiRepository!: Repository<Emoji>
  @inject(TYPES.MessageRepository) private readonly messageRepository!: Repository<Message>

  public listenTo (): Function {
    return TicketType
  }

  public async beforeUpdate (event: UpdateEvent<TicketType>): Promise<void> {
    if (event.updatedColumns.some(column => column.propertyName === 'messageId') && event.entity.messageId != null) {
      const messageEntity = this.messageRepository.create({
        id: event.entity.messageId,
        channelId: event.queryRunner.data.channelId,
        guildId: event.entity.guildId
      })
      if (typeof await this.messageRepository.findOne(messageEntity) === 'undefined') {
        await this.messageRepository.save(messageEntity)
      }
    }
    if (event.updatedColumns.some(column => column.propertyName === 'emojiId') && event.entity.emojiId != null) {
      const emojiEntity = this.emojiRepository.create({
        id: event.entity.emojiId,
        guildId: event.entity.guildId
      })
      if (typeof await this.emojiRepository.findOne(emojiEntity) === 'undefined') {
        await this.emojiRepository.save(emojiEntity)
      }
    }
  }
}
