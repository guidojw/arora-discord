'use strict'
const pluralize = require('pluralize')
const BaseCommand = require('../base')

class AddToGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtogroup',
      description: 'Adds a channel|role to a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'To what group do you want to add a channel|role?',
        type: 'integer|string'
      }, {
        key: 'channelOrRole',
        prompt: 'What channel or role do you want to add to this group?',
        type: 'text-channel|role'
      }]
    })
  }

  async run (message, { group, channelOrRole }) {
    group = message.guild.groups.resolve(group)
    if (!group) {
      return message.reply('Group not found.')
    }

    await group[pluralize(group.type)].add(channelOrRole)

    return message.reply(`Successfully added ${group.type} ${channelOrRole} to group **${group.name}**.`, {
      allowedMentions: {
        users: [message.author.id]
      }
    })
  }
}

module.exports = AddToGroupCommand
