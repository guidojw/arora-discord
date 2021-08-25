import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import type { Panel } from '../../structures'
import { discordService } from '../../services'

export default class PanelsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'panels',
      aliases: ['pnls'],
      description: 'Lists all panels.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to know the information of?',
        type: 'panel',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { panel }: { panel: Panel | '' }
  ): Promise<Message | Message[] | null> {
    if (panel !== '') {
      return await message.replyEmbed(panel.embed)
    } else {
      if (message.guild.panels.cache.size === 0) {
        return await message.reply('No panels found.')
      }

      const embeds = discordService.getListEmbeds(
        'Panels',
        message.guild.panels.cache.values(),
        getPanelRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
      return null
    }
  }
}

function getPanelRow (panel: Panel): string {
  return `${panel.id}. \`${panel.name}\``
}
