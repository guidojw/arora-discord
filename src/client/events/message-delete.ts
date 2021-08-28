import { inject, injectable } from 'inversify'
import type BaseHandler from '../base'
import type Client from '../client'
import type { CommandoMessage } from 'discord.js-commando'
import type { Message } from '../../entities'
import type { Repository } from 'typeorm'
import { constants } from '../../util'

const { TYPES } = constants

@injectable()
export default class MessageDeleteEventHandler implements BaseHandler {
  @inject(TYPES.MessageRepository)
  private readonly messageRepository!: Repository<Message>

  public async handle (_client: Client, message: CommandoMessage): Promise<void> {
    await this.messageRepository.delete(message.id)
  }
}
