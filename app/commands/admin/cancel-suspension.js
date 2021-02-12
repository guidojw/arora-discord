'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { getChannels, getTags, getUrls } = require('../../helpers/string')
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
        validate: val => getChannels(val)
          ? 'Reason contains channels.'
          : getTags(val)
            ? 'Reason contains tags.'
            : getUrls(val)
              ? 'Reason contains URLs.'
              : true
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

module.exports = CancelSuspensionCommand
