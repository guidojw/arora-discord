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
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to suspend?'
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
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(message.member.displayName)
            const suspension = (await applicationAdapter('put', `/v1/groups/${applicationConfig
                .groupId}/suspensions/${userId}`, {
                extended: true,
                duration: days * 86400,
                reason,
                by: byUserId,
                byUserId
            })).data
            if (suspension) {
                message.reply(`Successfully extended **${username}**'s suspension.`)
            } else {
                message.reply(`Couldn't extend **${username}**'s suspension.`)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
