'use strict'
const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class ExtendSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'extendsuspension',
      details: 'A suspension can be max 7 days long.',
      aliases: ['extend'],
      description: 'Extends the suspension of given user.',
      examples: ['extend Happywalker 3 He still doesn\'t understand.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose suspension would you like to extend?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'With how many days would you like to extend this person\'s suspension?',
        min: 1,
        max: 7
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason are you extending this person\'s suspension?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { username, days, reason }) {
    username = typeof username === 'string' ? username : username.displayName
    const [userId, authorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])

    await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/suspensions/${userId}/extend`, {
      duration: days * 86400000,
      authorId,
      reason
    })

    return message.reply(`Successfully extended **${username}**'s suspension.`)
  }
}

module.exports = ExtendSuspensionCommand
