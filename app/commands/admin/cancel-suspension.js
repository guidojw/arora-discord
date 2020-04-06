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
            clientPermissions: ['SEND_MESSAGES'],
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
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(message.member.displayName)
            await applicationAdapter('put', `/v1/groups/${applicationConfig.groupId}/suspensions/${
                userId}`, {
                cancelled: true,
                reason,
                by: byUserId,
                byUserId
            })
            message.reply(`Successfully cancelled **${username}**'s suspension.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
