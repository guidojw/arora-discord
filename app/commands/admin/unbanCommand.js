'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

module.exports = class UnbanCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'unban',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['unpban'],
            description: 'Unbans given username.',
            examples: ['unban Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to unban?'
                }
            ]
        })
    }

    async execute (message, { username }) {
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(message.member.displayName)
            await applicationAdapter('put', `/v1/bans/${userId}`, {
                unbanned: true,
                by: byUserId
            })
            message.reply(`Successfully unbanned **${username}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
