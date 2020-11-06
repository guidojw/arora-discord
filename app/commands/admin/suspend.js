'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

const { getChannels, getTags, getUrls } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class SuspendCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'suspend',
      details: 'Days can be max 7 and rankBack must be true or false. The reason must be encapsulated in quotes.',
      description: 'Suspends given user in the group.',
      examples: ['suspend Happywalker 3 "Spamming the group wall." false', 'suspend Happywalker 3 "Ignoring rules."'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Who would you like to suspend?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'How long would you like this suspension to be?',
        validate: val => {
          return val < 1 ? 'Insufficient amount of days.' : val > 7 ? 'Too many days.' : true
        }
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'For what reason are you suspending this person?',
        validate: val => getChannels(val)
          ? 'Reason contains channels.'
          : getTags(val)
            ? 'Reason contains tags.'
            : getUrls(val)
              ? 'Reason contains URLs.'
              : true
      }, {
        key: 'rankBack',
        type: 'boolean',
        prompt: 'Should this person get his old rank back when the suspension finishes?'
      }]
    })
  }

  async execute (message, { username, days, reason, rankBack }) {
    username = typeof username === 'string' ? username : username.displayName
    const [userId, authorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])

    await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions`, {
      duration: days * 86400000,
      rankBack,
      authorId,
      userId,
      reason
    })

    message.reply(`Successfully suspended **${username}**.`)
  }
}
