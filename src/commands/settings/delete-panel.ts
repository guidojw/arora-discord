import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Panel } from '../../structures'

export default class DeletePanelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'deletepanel',
      aliases: ['deletepnl', 'delpanel', 'delpnl'],
      description: 'Deletes a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to delete?',
        type: 'panel'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { panel }: { panel: Panel }
  ): Promise<Message | Message[] | null> {
    await message.guild.panels.delete(panel)

    return await message.reply('Successfully deleted panel.')
  }
}
