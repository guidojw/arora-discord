'use strict'
const BaseCommand = require('../base')

const { discordService } = require('../../services')

class PanelsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'panels',
      aliases: ['pnls'],
      description: 'Lists all panels.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to know the information of?',
        type: 'integer|string',
        default: ''
      }]
    })
  }

  async run (message, { panel }) {
    if (panel) {
      panel = message.guild.panels.resolve(panel)
      if (!panel) {
        return message.reply('Panel not found.')
      }

      return message.replyEmbed(panel.embed)
    } else {
      if (message.guild.panels.cache.size === 0) {
        return message.reply('No panels found.')
      }

      const embeds = discordService.getListEmbeds(
        'Panels',
        message.guild.panels.cache,
        getPanelRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getPanelRow ([, panel]) {
  return `${panel.id}. **${panel.name}**`
}

module.exports = PanelsCommand
