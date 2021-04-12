'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class ExtendBanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'extendban',
      description: 'Extends the ban of given user.',
      details: 'A ban can be max 7 days long, or permanent.',
      aliases: ['extend'],
      examples: ['extend Happywalker 3 He still doesn\'t understand.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose ban would you like to extend?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'With how many days would you like to extend this person\'s ban?',
        min: -6,
        max: 6
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason are you extending this person\'s ban?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, days, reason }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}/extend`, {
      authorId,
      duration: days * 24 * 60 * 60 * 1000,
      reason
    })

    return message.reply(`Successfully extended **${user.username ?? user.id}**'s ban.`)
  }
}

module.exports = ExtendBanCommand
