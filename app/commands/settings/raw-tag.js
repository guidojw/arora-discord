'use strict'

const BaseCommand = require('../base')

class RawTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'rawtag',
      description: 'Posts the raw content of a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        type: 'tag',
        prompt: 'What tag would you like the raw content of?'
      }]
    })
  }

  run (message, { tag }) {
    return message.reply(tag._content, { allowedMentions: { users: [message.author.id] } })
  }
}

module.exports = RawTagCommand
