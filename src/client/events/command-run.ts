import type { ArgumentCollectorResult, Command, CommandoMessage } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
import { DMChannel } from 'discord.js'
import { injectable } from 'inversify'
import { stripIndents } from 'common-tags'

@injectable()
export default class CommandRunEventHandler implements BaseHandler {
  public async handle (
    client: Client,
    command: Command,
    promise: Promise<unknown>,
    message: CommandoMessage,
    _args: Object | string | string[],
    _fromPattern: boolean,
    result: ArgumentCollectorResult
  ): Promise<void> {
    try {
      await promise
    } catch {
      // Command execution errors are handled by the commandError event handler.
      return
    }

    if (!(message.channel instanceof DMChannel)) {
      try {
        await message.channel.bulkDelete([
          ...result?.prompts.map(message => message.id),
          ...result?.answers.map(message => message.id)
        ])
      } catch {}
    }

    const guild = message.guild ?? client.mainGuild
    await guild.log(
      message.author,
      stripIndents`
      ${message.author} **used** \`${command.name}\` **command in** ${message.channel} ${message.channel.type !== 'dm' ? `[Jump to Message](${message.url})` : ''}
      ${message.content}
      `
    )
  }
}
