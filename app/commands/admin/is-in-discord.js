'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class IsInDiscordCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'isindiscord',
            description: 'Checks if given user is in the Discord server.',
            examples: ['isindiscord Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to check is the Discord server?',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }, guild) {
        const member = await discordService.getMemberByName(guild.guild, username)
        if (member) {
            message.reply( `Yes, **${member.displayName}** is in this server.`)
        } else {
            message.reply(`No, **${username}** is not in this server.`)
        }
    }
}
