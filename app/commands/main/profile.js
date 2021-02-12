'use strict'
const BaseCommand = require('../base')

const { userService } = require('../../services')

class ProfileCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'profile',
      aliases: ['playerurl', 'userurl', 'url'],
      description: 'Posts the Roblox profile of given user/you.',
      examples: ['profile', 'profile Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'username',
        prompt: 'Of which user would you like to know the profile?',
        default: '',
        type: 'member|string'
      }]
    })
  }

  async run (message, { username }) {
    username = username ? typeof username === 'string' ? username : username.displayName : message.member.displayName
    const userId = await userService.getIdFromUsername(username || message.member.displayName)

    return message.reply(`https://www.roblox.com/users/${userId}/profile`)
  }
}

module.exports = ProfileCommand
