'use strict'
const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { stringHelper } = require('../../helpers')
const { userService } = require('../../services')

class BanCommand extends BaseCommand {
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

    await applicationAdapter('post', '/v1/bans', {
      groupId: message.guild.robloxGroupId,
      authorId,
      userId,
      reason
    })

    return message.reply(`Successfully banned **${username}**.`)
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

module.exports = BanCommand
