'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')

class PromoteCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'promote',
      description: 'Promotes given user in the group.',
      examples: ['promote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        prompt: 'Who would you like to promote?',
        type: 'roblox-user'
      }]
    })
  }

  async run (message, { user }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    const roles = (await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/users/${user.id}/promote`, {
      authorId
    })).data

    return message.reply(`Successfully promoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

module.exports = PromoteCommand
