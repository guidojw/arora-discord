'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { stringHelper } = require('../../helpers')
const { userService } = require('../../services')

class ChangeBanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'changeban',
      details: 'Key must be author or reason. You can only change the author of bans you created.',
      description: 'Changes given user\'s ban\'s key to given data.',
      examples: ['changeban Happywalker author builderman'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose ban would you like to change?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to change?',
        oneOf: ['author', 'reason']
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to change this key\'s data to?'
      }]
    })
  }

  async run (message, { username, key, data }) {
    if (message.guild.robloxGroupId === null) {
      return message.reply('This server is not bound to a Roblox group yet.')
    }
    username = typeof username === 'string' ? username : username.displayName
    key = key.toLowerCase()
    const changes = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'reason') {
      const error = stringHelper.getChannels(data)
        ? 'Reason contains channels.'
        : stringHelper.getTags(data)
          ? 'Reason contains tags.'
          : stringHelper.getUrls(data)
            ? 'Reason contains URLs.'
            : undefined
      if (error) {
        return message.reply(error)
      }

      changes.reason = data
    }
    const [userId, editorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])

    await applicationAdapter('put', `/v1/bans/${userId}`, { changes, editorId })

    return message.reply(`Successfully changed **${username}**'s ban.`)
  }
}

module.exports = ChangeBanCommand
