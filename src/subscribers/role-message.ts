import type { Emoji, Message, Role, RoleMessage } from '../entities'
import type { EntitySubscriberInterface, InsertEvent, Repository } from 'typeorm'
import { EventSubscriber } from 'typeorm'
import { constants } from '../util'
import { inject } from 'inversify'

const { TYPES } = constants

@EventSubscriber()
export class ValidationSubscriber implements EntitySubscriberInterface<RoleMessage> {
  @inject(TYPES.EmojiRepository) private readonly emojiRepository!: Repository<Emoji>
  @inject(TYPES.MessageRepository) private readonly messageRepository!: Repository<Message>
  @inject(TYPES.RoleRepository) private readonly roleRepository!: Repository<Role>

  public async beforeInsert (event: InsertEvent<RoleMessage>): Promise<void> {
    const messageEntity = this.messageRepository.create({ id: event.entity.messageId, guildId: event.entity.guildId })
    if (typeof await this.messageRepository.findOne(messageEntity) === 'undefined') {
      await this.messageRepository.save(messageEntity)
    }
    const roleEntity = this.roleRepository.create({ id: event.entity.roleId, guildId: event.entity.guildId })
    if (typeof await this.roleRepository.findOne(roleEntity) === 'undefined') {
      await this.roleRepository.save(roleEntity)
    }
    if (event.entity.emojiId != null) {
      const emojiEntity = this.emojiRepository.create({ id: event.entity.emojiId, guildId: event.entity.guildId })
      if (typeof await this.emojiRepository.findOne(emojiEntity) === 'undefined') {
        await this.emojiRepository.save(emojiEntity)
      }
    }
  }
}
