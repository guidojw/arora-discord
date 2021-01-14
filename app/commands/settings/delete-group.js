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
        key: 'name',
        prompt: 'What group would you like to delete?',
        type: 'string',
        validate: _validateName
      }]
    })
  }

  async run (message, { name }) {
    name = name.toLowerCase()
    const group = await Group.findOne({
      where: { name, guildId: message.guild.id }
    })
    if (!group) {
      return message.reply('Group not found.')
    }

    message.guild.groups.delete(group.id)
    await group.destroy()

    return message.reply(`Successfully deleted group **${group.name}**.`)
  }
}

function _validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = DeleteGroupCommand
