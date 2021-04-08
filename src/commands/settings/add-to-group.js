'use strict'

const pluralize = require('pluralize')
const BaseCommand = require('../base')

class AddToGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtogroup',
      description: 'Adds a channel or role to a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'To what group do you want to add a channel or role?',
        type: 'arora-group'
      }, {
        key: 'channelOrRole',
        label: 'channel/role',
        prompt: 'What channel or role do you want to add to this group?',
        type: 'text-channel|role'
      }]
    })
  }

  async run (message, { group, channelOrRole }) {
    await group[pluralize(group.type)].add(channelOrRole)

    return message.reply(`Successfully added ${group.type} ${channelOrRole} to group \`${group.name}\`.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

module.exports = AddToGroupCommand
