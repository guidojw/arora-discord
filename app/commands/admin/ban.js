'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')

module.exports = class BanCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'ban',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Bans given username.',
            examples: ['unban Happywalker He apologized.'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to ban?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to ban this person?'
                }
            ]
        })
    }

    async execute (message, { username, reason }) {
        try {
            const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
                .getIdFromUsername(message.member.displayName)])
            await applicationAdapter('post', `/v1/bans`, {
                groupId: applicationConfig.groupId,
                authorId,
                userId,
                reason
            })
            message.reply(`Successfully banned **${username}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
