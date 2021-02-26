'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { Panel } = require('../../models')
const { discordService } = require('../../services')

class EditPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'editpanel',
      aliases: ['editpnl'],
      description: 'Edits a panel\'s content.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panelId',
        prompt: 'What panel would you like to edit?',
        type: 'integer'
      }, {
        key: 'content',
        prompt: 'What would you like to change the panel\'s content to?',
        type: 'string'
      }]
    })
  }

  async run (message, { panelId, content }) {
    const panel = await Panel.findOne({ where: { id: panelId, guildId: message.guild.id } })
    if (!panel) {
      return message.reply('Panel not found.')
    }
    let embed
    try {
      embed = new MessageEmbed(JSON.parse(content))
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        return message.reply(valid)
      }

      content = JSON.stringify(embed.toJSON())
    } catch (err) {
      return message.reply('Content has to be an embed object.')
    }

    await panel.update({ content })


    return message.reply(`Successfully edited panel **${panelId}**.`)
  }
}

module.exports = EditPanelCommand
