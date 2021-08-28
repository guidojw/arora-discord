import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'

export default class RestartCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'bot',
      name: 'restart',
      description: 'Restarts the bot.',
      clientPermissions: ['SEND_MESSAGES'],
      ownerOnly: true
    })
  }

  public async run (message: CommandoMessage): Promise<Message | Message[] | null> {
    await message.reply('Restarting...')
    process.exit()
  }
}
