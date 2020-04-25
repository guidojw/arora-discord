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
            description: 'Unbans given username.',
            examples: ['unban Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            ownerOnly: true,
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to unban?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to unban this person?'
                }
            ]
        })
    }

    async execute (message, { username, reason }) {
        try {
            const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
                .getIdFromUsername(message.member.displayName)])
            await applicationAdapter('post', `/v1/bans/${userId}/cancel`, { authorId, reason })
            message.reply(`Successfully unbanned **${username}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
