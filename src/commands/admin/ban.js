'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const {
  validators,
  noChannels,
  noTags,
  noUrls,
  parseNoneOrType,
  validateNoneOrType
} = require('../../util').argumentUtil

class BanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'ban',
      description: 'Bans given user.',
      examples: ['ban Happywalker Doing stuff.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to ban?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'For how long would you like this ban this person? Reply with "none" if you want this ban to be ' +
          'permanent.',
        min: 1,
        max: 7,
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to ban this person?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, days, reason }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans`, {
      userId: user.id,
      authorId,
      duration: typeof days === 'undefined' ? undefined : days * 24 * 60 * 60 * 1000,
      reason
    })

    return message.reply(`Successfully banned **${user.username ?? user.id}**.`)
  }
}

module.exports = BanCommand
