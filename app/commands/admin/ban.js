'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

const { getChannels, getTags, getUrls } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class BanCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'ban',
      description: 'Bans given user.',
      examples: ['unban Happywalker He apologized.'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Who would you like to ban?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to ban this person?',
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

    await applicationAdapter('post', '/v1/bans', {
      groupId: applicationConfig.groupId,
      authorId,
      userId,
      reason
    })

    message.reply(`Successfully banned **${username}**.`)
  }
}
