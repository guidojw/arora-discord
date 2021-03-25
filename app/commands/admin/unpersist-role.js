'use strict'
const BaseCommand = require('../base')

class UnpersistRoleCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'unpersistrole',
      aliases: ['unpersist'],
      description: 'Removes a persistent role from given member.',
      clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
      args: [{
        key: 'member',
        type: 'member',
        prompt: 'From who would you like to remove a persistent role?'
      }, {
        key: 'role',
        type: 'role',
        prompt: 'What role would you like to remove?'
      }]
    })
  }

  async run (message, { member, role }) {
    await member.unpersistRole(role)

    return message.reply(`Successfully removed persistent role **${role}** from member **${member}**.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

module.exports = UnpersistRoleCommand
