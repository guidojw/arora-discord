'use strict'
const pluralize = require('pluralize')
const BaseCommand = require('../base')

class RemoveFromGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'removefromgroup',
      description: 'Removes a channel|role from a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'From what group do you want to remove a channel|role?',
        type: 'integer|string'
      }, {
        key: 'channelOrRole',
        prompt: 'What channel or role do you want to remove from this group?',
        type: 'text-channel|role'
      }]
    })
  }

  async run (message, { idOrName, channelOrRole }) {
    const group = message.guild.groups.resolve(idOrName)
    if (!group) {
      return message.reply('Group not found.')
    }

    await group[pluralize(group.type)].remove(channelOrRole)

    return message.reply(`Successfully removed ${group.type} **${channelOrRole.id}** from group **${group.id}**.`)
  }
}

module.exports = RemoveFromGroupCommand
