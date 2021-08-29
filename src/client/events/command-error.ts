import type { ArgumentCollectorResult, Command, CommandoMessage } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import { DMChannel } from 'discord.js'
import axios from 'axios'
import { injectable } from 'inversify'

@injectable()
export default class CommandErrorEventHandler implements BaseHandler {
  public async handle (
    _client: Client,
    _command: Command,
    err: Error,
    message: CommandoMessage,
    _args: Object | string | string[],
    _fromPattern: boolean,
    result: ArgumentCollectorResult | null
  ): Promise<void> {
    if (axios.isAxiosError(err) && err.response?.data.errors?.length > 0) {
      await message.reply(err.response?.data.errors[0].message ?? err.response?.data.errors[0].msg)
    } else {
      await message.reply(err.message)
    }

    if (!(message.channel instanceof DMChannel)) {
      try {
        await message.channel.bulkDelete([...(result?.prompts ?? []), ...(result?.answers ?? [])])
      } catch {}
    }
  }
}
