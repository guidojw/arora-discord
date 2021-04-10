'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class SuspendCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'suspend',
      description: 'Suspends given user in the group.',
      details: 'Days can be max 7 and roleBack must be true or false.',
      examples: ['suspend Happywalker 3 "Spamming the group wall." false', 'suspend Happywalker 3 "Ignoring rules."'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to suspend?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'How long would you like this suspension to be?',
        min: 1,
        max: 7
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'For what reason are you suspending this person?',
        validate: validators([noChannels, noTags, noUrls])
      }, {
        key: 'roleBack',
        type: 'boolean',
        prompt: 'Should this person get their old role back when the suspension finishes?'
      }]
    })
  }

  async run (message, { user, days, reason, roleBack }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/suspensions`, {
      authorId,
      duration: days * 86400000,
      roleBack,
      reason,
      userId: user.id
    })

    return message.reply(`Successfully suspended **${user.username ?? user.id}**.`)
  }
}

module.exports = SuspendCommand
