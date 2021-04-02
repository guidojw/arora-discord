'use strict'

const Base = require('../base')

const { applicationAdapter } = require('../../adapters')
const { MessageEmbed } = require('discord.js')

class GetShoutCommand extends Base {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'getshout',
      description: 'Gets the current group shout.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true
    })
  }

  async run (message) {
    const shout = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/shout`)).data

    if (shout.body) {
      const embed = new MessageEmbed()
        .addField(`Current shout by ${shout.poster.username}`, shout.body)
        .setTimestamp(shout.updated)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      return message.reply('There currently is no shout.')
    }
  }
}

module.exports = GetShoutCommand
