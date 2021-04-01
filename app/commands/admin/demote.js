'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')

class DemoteCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'demote',
      description: 'Demotes given user in the group.',
      examples: ['demote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      requiresVerification: true,
      args: [{
        key: 'user',
        prompt: 'Who would you like to demote?',
        type: 'roblox-user'
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

    const roles = (await applicationAdapter('put', `/v1/groups/${message.guild.robloxGroupId}/users/${user.id}`, {
      authorId: message.member.robloxId,
      rank: rank > 100 && rank <= 102
        ? rank - 1
        : rank === 100
          ? 5
          : rank > 3 && rank <= 5
            ? rank - 1
            : rank === 3
              ? 1
              : undefined
    })).data

    return message.reply(`Successfully demoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

module.exports = DemoteCommand
