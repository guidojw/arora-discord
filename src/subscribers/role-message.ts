import { Emoji, Message, Role, RoleMessage } from '../entities'
import type { EntitySubscriberInterface, InsertEvent } from 'typeorm'
import { EventSubscriber } from 'typeorm'

@EventSubscriber()
export class RoleMessageSubscriber implements EntitySubscriberInterface<RoleMessage> {
  public listenTo (): Function {
    return RoleMessage
  }

  public async beforeInsert (event: InsertEvent<RoleMessage>): Promise<void> {
    const messageRepository = event.manager.getRepository(Message)
    const messageEntity = messageRepository.create({
      id: event.entity.messageId,
      guildId: event.entity.guildId,
      channelId: event.queryRunner.data.channelId
    })
    if (typeof await messageRepository.findOne(messageEntity) === 'undefined') {
      await messageRepository.save(messageEntity)
    }

    const roleRepository = event.manager.getRepository(Role)
    const roleEntity = roleRepository.create({ id: event.entity.roleId, guildId: event.entity.guildId })
    if (typeof await roleRepository.findOne(roleEntity) === 'undefined') {
      await roleRepository.save(roleEntity)
    }

    if (event.entity.emojiId != null) {
      const emojiRepository = event.manager.getRepository(Emoji)
      const emojiEntity = emojiRepository.create({ id: event.entity.emojiId, guildId: event.entity.guildId })
      if (typeof await emojiRepository.findOne(emojiEntity) === 'undefined') {
        await emojiRepository.save(emojiEntity)
      }
    }
  }
}
