'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class IsInDiscordCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'isindiscord',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if given username is in the Discord guild.',
            examples: ['isindiscord Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to check is the Discord guild?',
                    type: 'string'
                }
            ]
        })
    }

    execute (message, { username }, guild) {
        const member = discordService.getMemberByName(guild.guild, username)
        if (member) {
            message.replyEmbed(discordService.compileRichEmbed([{
                title: message.command.name,
                message: `Yes, **${member.nickname || member.user.username}** is in this server`,
            }]))
        } else {
            message.replyEmbed(discordService.compileRichEmbed([{
                title: message.command.name,
                message: `No, **${username}** is not in this server.`,
            }]))
        }
    }
}
