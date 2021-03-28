'use strict'

const pluralize = require('pluralize')
const BaseCommand = require('../base')

class RemoveFromGroupCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'removefromgroup',
      description: 'Removes a channel or role from a group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'From what group do you want to remove a channel or role?',
        type: 'nsadmin-group'
      }, {
        key: 'channelOrRole',
        prompt: 'What channel or role do you want to remove from this group?',
        type: 'text-channel|role'
      }]
    })
  }

  async run (message, { group, channelOrRole }) {
    await group[pluralize(group.type)].remove(channelOrRole)

    return message.reply(`Successfully removed ${group.type} ${channelOrRole} from group \`${group.name}\`.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

module.exports = RemoveFromGroupCommand
