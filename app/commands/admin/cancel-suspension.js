'use strict'
const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { stringHelper } = require('../../helpers')
const { userService } = require('../../services')

class CancelSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'cancelsuspension',
      description: 'Cancels given user\'s suspension.',
      examples: ['cancelsuspension Happywalker Good boy.'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose suspension would you like to cancel?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to cancel this person\'s suspension?',
        validate: validateReason
      }]
    })
  }

  async run (message, { username, reason }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
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

function validateReason (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return stringHelper.getChannels(val)
    ? 'Reason contains channels.'
    : stringHelper.getTags(val)
      ? 'Reason contains tags.'
      : stringHelper.getUrls(val)
        ? 'Reason contains URLs.'
        : true
}

module.exports = CancelSuspensionCommand
