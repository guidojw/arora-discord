'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')

class PromoteCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'promote',
      description: 'Promotes given user in the group.',
      examples: ['promote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        prompt: 'Who would you like to promote?',
        type: 'member|string'
      }]
    })
  }

  async run (message, { user }) {
    const rank = await userService.getRank(user.id, message.guild.robloxGroupId)
    if (rank === 0) {
      return message.reply('Can\'t change rank of non members.')
    }
    if (rank === 1) {
      return message.reply('Can\'t change rank of customers.')
    }
    if (rank === 2) {
      return message.reply('Can\'t change rank of suspended members.')
    }
    if (rank === 99) {
      return message.reply('Can\'t change rank of partners.')
    }
    if (rank >= 200) {
      return message.reply('Can\'t change rank of HRs.')
    }
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    const roles = (await applicationAdapter('put', `/v1/groups/${message.guild.robloxGroupId}/users/${user.id}`, {
      authorId,
      rank: rank === 1
        ? 3
        : (rank >= 3 && rank < 5) || (rank >= 100 && rank < 102)
            ? rank + 1
            : rank === 5
              ? 100
              : undefined
    })).data

    return message.reply(`Successfully promoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

module.exports = PromoteCommand
