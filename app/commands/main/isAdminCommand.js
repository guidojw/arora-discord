'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class IsAdminCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'isadmin',
            details: 'Nickname must be a existing nickname in the Discord guild.',
            aliases: ['amiadmin'],
            description: 'Checks if you/given nickname is admin.',
            examples: ['isadmin', 'isadmin @Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'member',
                    prompt: 'Who would you like to check is admin?',
                    type: 'member',
                    default: ''
                }
            ]
        })
    }

    execute (message, { member }, guild) {
        member = member || message.member
        const username = member.nickname || member.user.username
        if (discordService.isAdmin(member, guild.getData('adminRoles'))) {
            message.replyEmbed(discordService.getEmbed(message.command.name, `Yes, ${message.argString ? '**' +
                username + '** is' : 'you are'} admin!`))
        } else {
            message.replyEmbed(discordService.getEmbed(message.command.name, `No, ${message.argString ? '**' +
                username + '** is not' : 'you\'re not'} admin!`))
        }
    }
}
