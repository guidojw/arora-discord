import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Panel } from '../../structures'

export default class RawPanelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'rawpanel',
      aliases: ['rawpnl'],
      description: 'Posts the raw content of a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to know the raw content of?',
        type: 'panel'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { panel }: { panel: Panel }
  ): Promise<Message | Message[] | null> {
    return await message.reply(
      panel.content,
      { code: true, allowedMentions: { users: [message.author.id] } }
    )
  }
}
