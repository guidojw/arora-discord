'use strict'
const applicationAdapter = require('../../adapters/application')
const Base = require('../base')

const { MessageEmbed } = require('discord.js')

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
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    const shout = (await applicationAdapter('get', `/v1/groups/${message.guild.robloxGroupId}/shout`))
      .data

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
