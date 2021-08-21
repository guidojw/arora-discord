import type { EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm'
import type { Channel } from '../entities'
import { EventSubscriber } from 'typeorm'
import { Message } from '../entities'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  @inject(TYPES.ChannelRepository) private readonly channelRepository!: Repository<Channel>

  public listenTo (): Function {
    return Message
  }

  public async beforeInsert (event: InsertEvent<Message>): Promise<void> {
    const entity = this.channelRepository.create({ id: event.entity.channelId, guildId: event.entity.guildId })
    if (typeof await this.channelRepository.findOne(entity) === 'undefined') {
      await this.channelRepository.save(entity)
    }
  }
}
