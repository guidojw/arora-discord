'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class UnexileCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'unexile',
      description: 'Unexiles given user.',
      examples: ['unexile Happywalker They said they won\'t do it again.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to unexile?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to unexile this person?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { user, reason }) {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('DELETE', `v1/groups/${message.guild.robloxGroupId}/exiles/${user.id}`, {
      authorId,
      reason
    })

    return message.reply(`Successfully unexiled **${user.username ?? user.id}**.`)
  }
}

module.exports = UnexileCommand
