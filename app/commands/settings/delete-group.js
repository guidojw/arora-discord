'use strict'
const BaseCommand = require('../base')

class DeleteGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletegroup',
      aliases: ['delgroup'],
      description: 'Deletes a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'What group would you like to delete?',
        type: 'integer|string'
      }]
    })
  }

  async run (message, { idOrName }) {
    await message.guild.groups.delete(idOrName)

    return message.reply('Successfully deleted group.')
  }
}

module.exports = DeleteGroupCommand
