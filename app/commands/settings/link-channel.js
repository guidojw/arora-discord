'use strict'
const BaseCommand = require('../base')

class BindChannelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'bindchannel',
      aliases: ['bndchannel', 'bindc', 'bndc'],
      description: 'Binds a text channel to a voice channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'fromChannel',
        prompt: 'What text channel would you like to bind?',
        type: 'text-channel'
      }, {
        key: 'toChannel',
        prompt: 'To what voice channel would you like to bind this text channel?',
        type: 'voice-channel'
      }]
    })
  }

  async run (message, { fromChannel, toChannel }) {
    await toChannel.bindChannel(fromChannel)

    return message.reply(`Successfully bound text channel ${fromChannel} to voice channel ${toChannel}.`)
  }
}

module.exports = BindChannelCommand
