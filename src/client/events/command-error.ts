import type { ArgumentCollectorResult, Command, CommandoMessage } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import axios from 'axios'
import { injectable } from 'inversify'

@injectable()
export default class CommandErrorEventHandler implements BaseHandler {
  public async handle (
    client: Client,
    _command: Command,
    err: Error,
    message: CommandoMessage,
    _args: Object | string | string[],
    _fromPattern: boolean,
    result: ArgumentCollectorResult
  ): Promise<void> {
    if (axios.isAxiosError(err) && err.response?.data.errors?.length > 0) {
      await message.reply(err.response?.data.errors[0].message ?? err.response?.data.errors[0].msg)
    } else {
      await message.reply(err.message)
    }

    await Promise.all([
      ...result?.prompts.map(client.deleteMessage.bind(client)),
      ...result?.answers.map(client.deleteMessage.bind(client))
    ])
  }
}
