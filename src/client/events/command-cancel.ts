import type { ArgumentCollectorResult, Command, CommandoMessage } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import { injectable } from 'inversify'

@injectable()
export default class CommandCancelEventHandler implements BaseHandler {
  public async handle (
    client: Client,
    _command: Command,
    _reason: string,
    _message: CommandoMessage,
    result: ArgumentCollectorResult
  ): Promise<void> {
    await Promise.all([
      ...result?.prompts.map(client.deleteMessage.bind(client)),
      ...result?.answers.map(client.deleteMessage.bind(client))
    ])
  }
}
