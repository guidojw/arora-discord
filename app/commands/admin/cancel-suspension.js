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
        const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
            .getIdFromUsername(message.member.displayName)])
        await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions/${
            userId}/cancel`, {
            authorId,
            reason
        })
        message.reply(`Successfully cancelled **${username}**'s suspension.`)
    }
}
