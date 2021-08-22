import type { ArgumentCollectorResult, Command, CommandoMessage } from 'discord.js-commando'
import type BaseHandler from '../base'
import type Client from '../client'
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

    await Promise.all([
      ...result?.prompts.map(client.deleteMessage.bind(client)),
      ...result?.answers.map(client.deleteMessage.bind(client))
    ])

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
