'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')

const { getChannels, getTags, getUrls } = require('../../helpers/string')
const { userService } = require('../../services')

class ChangeSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'changesuspension',
      details: 'Key must be author, reason or rankBack. RankBack must be true or false. You can only change the' +
        ' author of suspensions you created.',
      description: 'Changes given user\'s suspension\'s key to given data.',
      examples: ['changesuspension Happywalker rankBack false'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        type: 'member|string',
        prompt: 'Whose suspension would you like to change?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to change?',
        oneOf: ['author', 'reason', 'rankback']
      }, {
        key: 'data',
        type: 'boolean|string',
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
      const error = getChannels(data)
        ? 'Reason contains channels.'
        : getTags(data)
          ? 'Reason contains tags.'
          : getUrls(data)
            ? 'Reason contains URLs.'
            : undefined
      if (error) {
        return message.reply(error)
      }

      changes.reason = data
    } else if (key === 'rankback') {
      if (data !== true && data !== false) {
        return message.reply(`**${data}** is not a valid value for rankBack.`)
      }

      changes.rankBack = data
    }
    const [userId, editorId] = await Promise.all([
      userService.getIdFromUsername(username),
      userService.getIdFromUsername(message.member.displayName)
    ])

    await applicationAdapter('put', `/v1/groups/${message.guild.robloxGroupId}/suspensions/${userId}`, {
      changes,
      editorId
    })

    return message.reply(`Successfully changed **${username}**'s suspension.`)
  }
}

module.exports = ChangeSuspensionCommand
