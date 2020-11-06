'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class IsAdminCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'isadmin',
      aliases: ['amiadmin'],
      description: 'Checks if you/given member is admin.',
      examples: ['isadmin', 'isadmin Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'member',
        prompt: 'Who would you like to check is admin?',
        type: 'member',
        default: ''
      }]
    })
  }

  execute (message, { member }, guild) {
    member = member || message.member
    const username = member.displayName

    if (discordService.isAdmin(member, guild.getData('adminRoles'))) {
      message.reply(`Yes, ${message.argString ? '**' + username + '** is' : 'you are'} admin!`)
    } else {
      message.reply(`No, ${message.argString ? '**' + username + '** is not' : 'you\'re not'} admin!`)
    }
  }
}
