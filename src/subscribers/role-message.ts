import { Emoji, Message, Role, RoleMessage } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'

@EventSubscriber()
export class RoleMessageSubscriber implements EntitySubscriberInterface<RoleMessage> {
  public listenTo (): Function {
    return RoleMessage
  }

  public async beforeInsert (event: InsertEvent<RoleMessage>): Promise<void> {
    const messageRepository = event.manager.getRepository(Message)
    const messageFields = {
      id: event.entity.messageId,
      guildId: event.entity.guildId,
      channelId: event.queryRunner.data.channelId
    }
    if (await messageRepository.findOneBy(messageFields) === null) {
      await messageRepository.save(messageRepository.create(messageFields))
    }

    const roleRepository = event.manager.getRepository(Role)
    const roleFields = { id: event.entity.roleId, guildId: event.entity.guildId }
    if (await roleRepository.findOneBy(roleFields) === null) {
      await roleRepository.save(roleRepository.create(roleFields))
    }

    if (event.entity.emojiId != null) {
      const emojiRepository = event.manager.getRepository(Emoji)
      const emojiFields = { id: event.entity.emojiId, guildId: event.entity.guildId }
      if (await emojiRepository.findOneBy(emojiFields) === null) {
        await emojiRepository.save(emojiRepository.create(emojiFields))
      }
    }
  }
}
