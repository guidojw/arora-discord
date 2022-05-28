import { Channel, Guild } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type UpdateEvent } from 'typeorm'

@EventSubscriber()
export class GuildSubscriber implements EntitySubscriberInterface<Guild> {
  public listenTo (): Function {
    return Guild
  }

  public async beforeUpdate (event: UpdateEvent<Guild>): Promise<void> {
    if (typeof event.entity === 'undefined') {
      return
    }

    const channelRepository = event.manager.getRepository(Channel)
    for (const column of event.updatedColumns) {
      if ((column.propertyName.includes('ChannelId') || column.propertyName.includes('CategoryId'))) {
        const value = event.entity[column.propertyName as keyof Guild] as string
        if (value != null) {
          const fields = { id: value, guildId: event.entity.id }
          if (await channelRepository.findOneBy(fields) === null) {
            await channelRepository.save(channelRepository.create(fields))
          }
        }
      }
    }
  }
}
