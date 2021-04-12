'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { noChannels, noTags, noUrls } = require('../../util').argumentUtil

class EditBanCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'editban',
      description: 'Edits given user\'s ban\'s key to given data.',
      details: 'Key must be author or reason.',
      examples: ['editban Happywalker author builderman'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose ban would you like to edit?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to edit?',
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
    const editorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof editorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('PUT', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}`, { changes, editorId })

    return message.reply(`Successfully edited **${user.username ?? user.id}**'s ban.`)
  }
}

module.exports = EditBanCommand
