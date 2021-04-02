'use strict'

const BaseCommand = require('../base')

class ProfileCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'profile',
      aliases: ['playerurl', 'userurl', 'url'],
      description: 'Posts the Roblox profile of given user/you.',
      examples: ['profile', 'profile Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      args: [{
        key: 'user',
        prompt: 'Of which user would you like to know the profile?',
        type: 'roblox-user',
        default: 'self'
      }]
    })
  }

  run (message, { user }) {
    return message.reply(`https://www.roblox.com/users/${user.id}/profile`)
  }
}

module.exports = ProfileCommand
