import { inject, injectable, tagged } from 'inversify'
import type BaseHandler from '../base'
import type Client from '../client'
import type { CommandoMessage } from 'discord.js-commando'
import { constants } from '../../util'

const { TYPES } = constants

@injectable()
export default class MessageDeleteBulkEventHandler implements BaseHandler {
  @inject(TYPES.Handler) @tagged('eventHandler', 'messageDelete')
  private readonly messageDeleteEventHandler!: BaseHandler

  public async handle (client: Client, messages: CommandoMessage[]): Promise<void> {
    await messages.map(this.messageDeleteEventHandler.handle.bind(this.messageDeleteEventHandler, client))
  }
}
