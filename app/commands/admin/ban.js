'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class BanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'ban',
      description: 'Bans given user.',
      examples: ['unban Happywalker He apologized.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      requiresVerification: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to ban?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to ban this person?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, reason }) {
    await applicationAdapter('post', '/v1/bans', {
      authorId: message.member.robloxId,
      groupId: message.guild.robloxGroupId,
      reason,
      userId: user.id
    })

    return message.reply(`Successfully banned **${user.username ?? user.id}**.`)
  }
}

module.exports = BanCommand
