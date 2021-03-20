'use strict'
const BaseCommand = require('../base')

class UnbindChannelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'unbindchannel',
      aliases: ['unbndchannel', 'unbindc', 'unbndc'],
      description: 'Unbinds a text channel from a voice channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'fromChannel',
        prompt: 'From what voice channel would you like to unbind a text channel?',
        type: 'voice-channel'
      }, {
        key: 'toChannel',
        prompt: 'What text channel would you like to unbind from this voice channel?',
        type: 'text-channel'
      }]
    })
  }

  async run (message, { fromChannel, toChannel }) {
    await fromChannel.unbindChannel(toChannel)

    return message.reply(`Successfully unbound text channel ${toChannel} from voice channel ${fromChannel}.`)
  }
}

module.exports = UnbindChannelCommand
