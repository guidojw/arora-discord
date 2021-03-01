'use strict'
const BaseCommand = require('../base')

class AddToGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtogroup',
      description: 'Adds a channel|role to a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'To what group do you want to add a channel|role?',
        type: 'integer|string'
      }, {
        key: 'channelOrRole',
        prompt: 'What channel|role do you want to add to this group?',
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
      await group.channels.add(channelOrRole)

      return message.reply(`Successfully added channel **${channelOrRole.id}** to group **${group.id}**.`)
    } else {
      await group.roles.add(channelOrRole)

      return message.reply(`Successfully added role **${channelOrRole.id}** to group **${group.id}**.`)
    }
  }
}

module.exports = AddToGroupCommand
