'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
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
        key: 'idOrName',
        prompt: 'What panel would you like to edit?',
        type: 'integer|string'
      }, {
        key: 'content',
        prompt: 'What would you like to change the panel\'s content to?',
        type: 'string'
      }]
    })
  }

  async run (message, { idOrName, content }) {
    const panel = message.guild.panels.resolve(idOrName)
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
      return message.reply('Content has to be an JSON object.')
    }

    await panel.update({ content })

    return message.reply(`Successfully edited panel **${panel.name}**.`)
  }
}

module.exports = EditPanelCommand
