'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class CancelSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'cancelsuspension',
      description: 'Cancels given user\'s suspension.',
      examples: ['cancelsuspension Happywalker Good boy.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose suspension would you like to cancel?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to cancel this person\'s suspension?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, reason }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/suspensions/${user.id}/cancel`, {
      authorId,
      reason
    })

    return message.reply(`Successfully cancelled **${user.username ?? user.id}**'s suspension.`)
  }
}

module.exports = CancelSuspensionCommand
