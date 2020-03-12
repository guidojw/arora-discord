'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')
const BotEmbed = require('../../views/botEmbed')

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
        const embed = new BotEmbed()
        if (member) {
            embed.addField(message.command.name, `Yes, **${member.nickname || member.user.username}** is in ` +
                'this server')
        } else {
            embed.addField(message.command.name, `No, **${username}** is not in this server.`)
        }
        message.replyEmbed(embed)
    }
}
