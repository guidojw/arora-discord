'use strict'

const BaseCommand = require('../base')

class RestartCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'bot',
      name: 'restart',
      description: 'Restarts the bot.',
      clientPermissions: ['SEND_MESSAGES'],
      ownerOnly: true
    })
  }

  async run (message) {
    await message.reply('Restarting...')
    process.exit()
  }
}

module.exports = RestartCommand
