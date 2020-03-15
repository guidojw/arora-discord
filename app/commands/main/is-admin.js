'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')
const BotEmbed = require('../../views/bot-embed')

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
        const username = member.displayName
        const embed = new BotEmbed()
        if (discordService.isAdmin(member, guild.getData('adminRoles'))) {
            embed.addField(message.command.name, `Yes, ${message.argString ? '**' + username + '** is' : 'you ' +
                'are'} admin!`)
        } else {
            embed.addField(message.command.name, `No, ${message.argString ? '**' + username + '** is not' : 
                'you\'re not'} admin!`)
        }
        message.replyEmbed(embed)
    }
}
