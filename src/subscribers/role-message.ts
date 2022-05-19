import { Emoji, Message, Role, RoleMessage } from '../entities'
import { type EntitySubscriberInterface, EventSubscriber, type InsertEvent } from 'typeorm'

@EventSubscriber()
export class RoleMessageSubscriber implements EntitySubscriberInterface<RoleMessage> {
  public listenTo (): Function {
    return RoleMessage
  }

  public async beforeInsert (event: InsertEvent<RoleMessage>): Promise<void> {
    const messageRepository = event.manager.getRepository(Message)
    if (await messageRepository.findOneBy({ id: event.entity.messageId }) === null) {
      await messageRepository.save(messageRepository.create({
        id: event.entity.messageId,
        guildId: event.entity.guildId,
        channelId: event.queryRunner.data.channelId
      }))
    }

    const roleRepository = event.manager.getRepository(Role)
    if (await roleRepository.findOneBy({ id: event.entity.roleId }) === null) {
      await roleRepository.save(roleRepository.create({ id: event.entity.roleId, guildId: event.entity.guildId }))
    }

    if (event.entity.emojiId != null) {
      const emojiRepository = event.manager.getRepository(Emoji)
      if (await emojiRepository.findOneBy({ id: event.entity.emojiId }) === null) {
        await emojiRepository.save(emojiRepository.create({ id: event.entity.emojiId, guildId: event.entity.guildId }))
      }
    }
  }
}
