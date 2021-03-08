'use strict'
const BaseCommand = require('../base')

class DeleteTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetag',
      aliases: ['deltag'],
      description: 'Deletes a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'What tag would you like to delete?',
        type: 'integer|string'
      }]
    })
  }

  async run (message, { idOrName }) {
    await message.guild.tags.delete(idOrName)

    return message.reply('Successfully deleted tag.')
  }
}

module.exports = DeleteTagCommand
