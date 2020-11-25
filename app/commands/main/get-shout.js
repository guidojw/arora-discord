'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class GetShoutCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'getshout',
      description: 'Gets the current group shout.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  async execute (message, _args, guild) {
    const shout = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/shout`))
      .data

    if (shout.body) {
      const embed = new MessageEmbed()
        .addField(`Current shout by ${shout.poster.username}`, shout.body)
        .setTimestamp(shout.updated)
        .setColor(guild.getData('primaryColor'))
      message.replyEmbed(embed)
    } else {
      message.reply('There currently is no shout.')
    }
  }
}
