'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const userService = require('../../services/user')

const { getChannels, getTags, getUrls } = require('../../helpers/string')

class UnbanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'unban',
      description: 'Unbans given user.',
      examples: ['unban Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      ownerOnly: true,
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Who would you like to unban?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to unban this person?',
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

    await applicationAdapter('post', `/v1/bans/${userId}/cancel`, { authorId, reason })

    return message.reply(`Successfully unbanned **${username}**.`)
  }
}

module.exports = UnbanCommand
