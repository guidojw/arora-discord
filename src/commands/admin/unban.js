'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class UnbanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'unban',
      description: 'Unbans given user.',
      examples: ['unban Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      ownerOnly: true,
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to unban?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to unban this person?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, reason }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/bans/${user.id}/cancel`, { authorId, reason })

    return message.reply(`Successfully unbanned **${user.username ?? user.id}**.`)
  }
}

module.exports = UnbanCommand
