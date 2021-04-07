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
      requiresApi: true,
      requiresRobloxGroup: true,
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
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans`, {
      userId: user.id,
      authorId,
      reason
    })

    return message.reply(`Successfully banned **${user.username ?? user.id}**.`)
  }
}

module.exports = BanCommand
