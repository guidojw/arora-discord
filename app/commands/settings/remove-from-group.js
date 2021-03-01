'use strict'
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
        prompt: 'What channel|role do you want to remove from this group?',
        type: 'channel|role'
      }]
    })
  }

  async run (message, { idOrName, channelOrRole }) {
    const group = message.guild.groups.resolve(idOrName)
    if (!group) {
      return message.reply('Group not found.')
    }

    if (group.type === 'channel') {
      await group.channels.remove(channelOrRole)

      return message.reply(`Successfully removed channel **${channelOrRole.id}** from group **${group.id}**.`)
    } else {
      await group.roles.remove(channelOrRole)

      return message.reply(`Successfully removed role **${channelOrRole.id}** from group **${group.id}**.`)
    }
  }
}

module.exports = RemoveFromGroupCommand
