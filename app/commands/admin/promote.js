'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const userService = require('../../services/user')

const applicationConfig = require('../../../config/application')

class PromoteCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'promote',
      description: 'Promotes given user in the group.',
      examples: ['promote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        prompt: 'Who would you like to promote?',
        type: 'member|string'
      }]
    })
  }

  async execute (message, { username }) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const [userId, authorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])
    const rank = await userService.getRank(userId, applicationConfig.groupId)
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

    const roles = (await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/users/${userId}`, {
      authorId,
      rank: rank === 1
        ? 3
        : (rank >= 3 && rank < 5) || (rank >= 100 && rank < 102)
            ? rank + 1
            : rank === 5
              ? 100
              : undefined
    })).data

    return message.reply(`Successfully promoted **${username}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

module.exports = PromoteCommand
