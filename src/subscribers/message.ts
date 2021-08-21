import type { Channel, Message } from '../entities'
import type { EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm'
import { EventSubscriber } from 'typeorm'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  @inject(TYPES.ChannelRepository) private readonly channelRepository!: Repository<Channel>

  public async beforeInsert (event: InsertEvent<Message>): Promise<void> {
    const entity = this.channelRepository.create({ id: event.entity.channelId, guildId: event.entity.guildId })
    if (typeof await this.channelRepository.findOne(entity) === 'undefined') {
      await this.channelRepository.save(entity)
    }
  }
}
