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
        key: 'group',
        prompt: 'What group would you like to delete?',
        type: 'arora-group'
      }]
    })
  }

  async run (message, { group }) {
    await message.guild.groups.delete(group)

    return message.reply('Successfully deleted group.')
  }
}

module.exports = DeleteGroupCommand
