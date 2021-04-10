'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { noChannels, noTags, noUrls } = require('../../util').argumentUtil

class ChangeSuspensionCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'changesuspension',
      details: 'Key must be "author", "reason" or "roleBack". You can only change the author of suspensions you ' +
        'created.',
      description: 'Changes given user\'s suspension\'s key to given data.',
      examples: ['changesuspension Happywalker roleBack false'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose suspension would you like to change?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to change?',
        oneOf: ['author', 'reason', 'roleback'],
        parse: val => val.toLowerCase()
      }, {
        key: 'data',
        type: 'boolean|string',
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
    } else if (key === 'roleback') {
      if (data !== true && data !== false) {
        return message.reply('`roleBack` must be true or false.')
      }

      changes.roleBack = data
    }
    const editorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof editorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('PUT', `v1/groups/${message.guild.robloxGroupId}/suspensions/${user.id}`, {
      changes,
      editorId
    })

    return message.reply(`Successfully changed **${user.username ?? user.id}**'s suspension.`)
  }
}

module.exports = ChangeSuspensionCommand
