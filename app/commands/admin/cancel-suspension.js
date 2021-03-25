'use strict'
const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class CancelSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'cancelsuspension',
      description: 'Cancels given user\'s suspension.',
      examples: ['cancelsuspension Happywalker Good boy.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose suspension would you like to cancel?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to cancel this person\'s suspension?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { username, reason }) {
    username = typeof username === 'string' ? username : username.displayName
    const [userId, authorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])

    await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/suspensions/${userId}/cancel`, {
      authorId,
      reason
    })

    return message.reply(`Successfully cancelled **${username}**'s suspension.`)
  }
}

module.exports = CancelSuspensionCommand
