'use strict'
const BaseCommand = require('../base')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')
const { Op } = require('sequelize')
const { Panel } = require('../../models')

class CreatePanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createpanel',
      aliases: ['createpnl'],
      description: 'Creates a new panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the panel to be?',
        type: 'string'
      }, {
        key: 'content',
        prompt: 'What do you want the content of the panel to be?',
        type: 'string'
      }]
    })
  }

  async run (message, { name, content }) {
    if (await Panel.findOne({
      where: {
        name: { [Op.iLike]: name },
        guildId: message.guild.id
      }
    })) {
      return message.reply('A panel with that name already exists.')
    }
    try {
      const embed = new MessageEmbed(JSON.parse(content))
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        return message.reply(valid)
      }

      content = JSON.stringify(embed.toJSON())
    } catch (err) {
      return message.reply('Content has to be an embed object.')
    }

    await Panel.create({ guildId: message.guild.id, name, content })

    return message.reply(`Successfully created panel **${name}**.`)
  }
}

module.exports = CreatePanelCommand
