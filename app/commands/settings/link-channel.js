'use strict'
const BaseCommand = require('../base')

class LinkChannelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'linkchannel',
      aliases: ['linkc'],
      description: 'Links a voice channel to a text channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'fromChannel',
        prompt: 'What voice channel would you like to link?',
        type: 'voice-channel'
      }, {
        key: 'toChannel',
        prompt: 'What text channel would you like to link to this voice channel?',
        type: 'text-channel'
      }]
    })
  }

  async run (message, { fromChannel, toChannel }) {
    await fromChannel.linkChannel(toChannel)

    return message.reply(`Successfully linked voice channel ${fromChannel} to text channel ${toChannel}.`)
  }
}

module.exports = LinkChannelCommand
