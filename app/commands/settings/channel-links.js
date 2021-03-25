'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

class ChannelLinksCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'channellinks',
      description: 'Fetches given voice channel\'s linked text channels.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'channel',
        type: 'voice-channel',
        prompt: 'Of what voice channel would you like to know the linked text channels?'
      }]
    })
  }

  async run (message, { channel }) {
    const links = await channel.fetchToLinks()
    if (links.size === 0) {
      return message.reply('No links found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${channel.name}'s Channel Links`)
      .setDescription(links.map(channel => channel.toString()))
      .setColor(message.guild.primaryColor)
    return message.replyEmbed(embed)
  }
}

module.exports = ChannelLinksCommand
