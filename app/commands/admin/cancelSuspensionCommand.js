'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')

module.exports = class CancelSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'cancelsuspension',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Cancels given username\'s suspension.',
            examples: ['cancelsuspension Happywalker Good boy.'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose suspension would you like to cancel?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to cancel this person\'s suspension?'
                }
            ]
        })
    }

    async execute (message, { username, reason }) {
        const byUsername = message.member.nickname || message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(byUsername)
            const suspension = (await applicationAdapter('put', `/v1/groups/${applicationConfig
                    .groupId}/suspensions/${userId}`, {
                cancelled: true,
                reason: reason,
                by: byUserId
            })).data
            if (suspension) {
                message.reply(`Successfully cancelled **${username}**'s suspension.`)
            } else {
                message.reply(`Couldn't cancel **${username}**'s suspension.`)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
