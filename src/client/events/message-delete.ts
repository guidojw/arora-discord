import { inject, injectable } from 'inversify'
import type { BaseHandler } from '..'
import type { Message as DiscordMessage } from 'discord.js'
import type { Message } from '../../entities'
import { Repository } from 'typeorm'
import { constants } from '../../utils'

const { TYPES } = constants

@injectable()
export default class MessageDeleteEventHandler implements BaseHandler {
  @inject(TYPES.MessageRepository)
  private readonly messageRepository!: Repository<Message>

  public async handle (message: DiscordMessage): Promise<void> {
    await this.messageRepository.delete(message.id)
  }
}
