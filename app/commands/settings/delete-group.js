'use strict'
const BaseCommand = require('../base')

const { Group } = require('../../models')

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
    const group = message.guild.groups.cache.find(group => group.id === groupId)
    if (!group) {
      return message.reply('Group not found.')
    } else if (group.guarded) {
      return message.reply('Guarded groups cannot be deleted.')
    }

    await group.delete()

    return message.reply(`Successfully deleted group **${group.id}**.`)
  }
}

module.exports = DeleteGroupCommand
