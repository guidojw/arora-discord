import type { ArgumentCollectorResult, Command, CommandoMessage } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import { DMChannel } from 'discord.js'
import { injectable } from 'inversify'

@injectable()
export default class CommandCancelEventHandler implements BaseHandler {
  public async handle (
    _client: Client,
    _command: Command,
    _reason: string,
    message: CommandoMessage,
    result: ArgumentCollectorResult
  ): Promise<void> {
    if (!(message.channel instanceof DMChannel)) {
      try {
        await message.channel.bulkDelete([
          ...result?.prompts.map(message => message.id),
          ...result?.answers.map(message => message.id)
        ])
      } catch {}
    }
  }
}
