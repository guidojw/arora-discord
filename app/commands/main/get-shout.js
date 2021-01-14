'use strict'
const applicationAdapter = require('../../adapters/application')
const Base = require('../base')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

class GetShoutCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'getshout',
      description: 'Gets the current group shout.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  async run (message) {
    const shout = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/shout`))
      .data

    if (shout.body) {
      const embed = new MessageEmbed()
        .addField(`Current shout by ${shout.poster.username}`, shout.body)
        .setTimestamp(shout.updated)
        .setColor(message.guild.getData('primaryColor'))
      return message.replyEmbed(embed)
    } else {
      return message.reply('There currently is no shout.')
    }
  }
}

module.exports = GetShoutCommand
