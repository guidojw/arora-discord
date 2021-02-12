'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { userService } = require('../../services')

class DemoteCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'demote',
      description: 'Demotes given user in the group.',
      examples: ['demote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        prompt: 'Who would you like to demote?',
        type: 'member|string'
      }]
    })
  }

  async run (message, { username }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const [userId, authorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])
    const rank = await userService.getRank(userId, message.guild.robloxGroupId)
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

    const roles = (await applicationAdapter('put', `/v1/groups/${message.guild.robloxGroupId}/users/${userId}`, {
      authorId,
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

    return message.reply(`Successfully demoted **${username}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}

module.exports = DemoteCommand
