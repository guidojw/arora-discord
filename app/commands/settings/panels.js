'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { Panel } = require('../../models')
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
        key: 'panelId',
        prompt: 'What panel ID would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  async run (message, { panelId }) {
    if (panelId) {
      const panel = await Panel.findOne({ where: { id: panelId, guildId: message.guild.id } })
      if (!panel) {
        return message.reply('Panel not found.')
      }

      const embed = new MessageEmbed(JSON.parse(panel.content))
      return message.replyEmbed(embed)
    } else {
      const panels = await Panel.findAll({ where: { guildId: message.guild.id } })
      if (panels.length === 0) {
        return message.reply('No panels found.')
      }

      const embeds = discordService.getListEmbeds(
        'Panels',
        panels,
        getPanelRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
    }
  }
}

function getPanelRow ([, panel]) {
  return `${panel.id}. **${panel.name}**\n`
}

module.exports = PanelsCommand
