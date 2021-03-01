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
        key: 'groupId',
        prompt: 'What group would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async run (message, { groupId }) {
    await message.guild.groups.delete(groupId)

    return message.reply(`Successfully deleted group.`)
  }
}

module.exports = DeleteGroupCommand
