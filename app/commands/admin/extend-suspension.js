'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')

module.exports = class ExtendSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'extendsuspension',
            details: 'Username must be a username that is being used on Roblox. A suspension can be max 7 days long.',
            aliases: ['extend'],
            description: 'Extends the suspension of given username.',
            examples: ['extend Happywalker 3 He still doesn\'t understand.'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose suspension would you like to extend?'
                },
                {
                    key: 'days',
                    type: 'integer',
                    prompt: 'With how many days would you like to extend this person\'s suspension?',
                    validate: val => {
                        if (val < 1) return 'Insufficient amount of days.'
                        if (val > 7) return 'Too many days.'
                        return true
                    }
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason are you extending this person\'s suspension?'
                }
            ]
        })
    }

    async execute (message, { username, days, reason }) {
        const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
            .getIdFromUsername(message.member.displayName)])
        await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions/${
            userId}/extend`, {
            duration: days * 86400000,
            authorId,
            reason
        })
        message.reply(`Successfully extended **${username}**'s suspension.`)
    }
}
