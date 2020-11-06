'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

const { getChannels, getTags, getUrls } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class CancelSuspensionCommand extends Command {
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

  async execute (message, { username, reason }) {
    username = typeof username === 'string' ? username : username.displayName
    const [userId, authorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])

    await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions/${userId}/cancel`, {
      authorId,
      reason
    })

    message.reply(`Successfully cancelled **${username}**'s suspension.`)
  }
}
