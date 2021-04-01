'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { noChannels, noTags, noUrls } = require('../../util').argumentUtil

class ChangeBanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'changeban',
      details: 'Key must be author or reason. You can only change the author of bans you created.',
      description: 'Changes given user\'s ban\'s key to given data.',
      examples: ['changeban Happywalker author builderman'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      requiresVerification: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose ban would you like to change?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to change?',
        oneOf: ['author', 'reason'],
        parse: val => val.toLowerCase()
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to change this key\'s data to?'
      }]
    })
  }

  async run (message, { user, key, data }) {
    const changes = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'reason') {
      const results = [noChannels(data, key), noTags(data, key), noUrls(data, key)]
      if (!results.every(result => result && typeof result !== 'string')) {
        const errors = results.filter(result => typeof result === 'string')
        return message.reply(errors.join('\n'))
      }

      changes.reason = data
    }

    await applicationAdapter('put', `/v1/bans/${user.id}`, {
      changes,
      editorId: message.member.robloxId
    })

    return message.reply(`Successfully changed **${user.username ?? user.id}**'s ban.`)
  }
}

module.exports = ChangeBanCommand
