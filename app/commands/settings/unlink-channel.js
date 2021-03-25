'use strict'
const BaseCommand = require('../base')

class UnlinkChannelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'unlinkchannel',
      aliases: ['unlinkc'],
      description: 'Unlinks a text channel from a voice channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'fromChannel',
        prompt: 'What voice channel would you like to unlink?',
        type: 'voice-channel'
      }, {
        key: 'toChannel',
        prompt: 'What text channel would you like to unlink from this voice channel?',
        type: 'text-channel'
      }]
    })
  }

  async run (message, { fromChannel, toChannel }) {
    await fromChannel.unlinkChannel(toChannel)

    return message.reply(`Successfully unlinked text channel ${toChannel} from voice channel ${fromChannel}.`)
  }
}

module.exports = UnlinkChannelCommand
