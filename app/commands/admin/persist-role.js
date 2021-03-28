'use strict'

const BaseCommand = require('../base')

class PersistRoleCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'persistrole',
      aliases: ['persist'],
      description: 'Persists a role on given member.',
      clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
      args: [{
        key: 'member',
        type: 'member',
        prompt: 'Who would you like to give a persistent role?'
      }, {
        key: 'role',
        type: 'role',
        prompt: 'What role would you like to persist on this person?'
      }]
    })
  }

  async run (message, { member, role }) {
    await member.persistRole(role)

    return message.reply(`Successfully persisted role **${role}** on member **${member}**.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}

module.exports = PersistRoleCommand
