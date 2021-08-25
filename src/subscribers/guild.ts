import type { EntitySubscriberInterface, Repository, UpdateEvent } from 'typeorm'
import type { Channel } from '../entities'
import { EventSubscriber } from 'typeorm'
import { Guild } from '../entities'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class GuildSubscriber implements EntitySubscriberInterface<Guild> {
  @inject(TYPES.ChannelRepository) private readonly channelRepository!: Repository<Channel>

  public listenTo (): Function {
    return Guild
  }

  public async beforeUpdate (event: UpdateEvent<Guild>): Promise<void> {
    for (const column of event.updatedColumns) {
      if ((column.propertyName.includes('ChannelId') || column.propertyName.includes('CategoryId'))) {
        const value = event.entity[column.propertyName as keyof Guild] as string
        if (value != null) {
          const entity = this.channelRepository.create({ id: value, guildId: event.entity.id })
          if (typeof await this.channelRepository.findOne(entity) === 'undefined') {
            await this.channelRepository.save(entity)
          }
        }
      }
    }
  }
}
