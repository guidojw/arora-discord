'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationConfig = require('../../../config/application')
const applicationAdapter = require('../../adapters/application')

module.exports = class SuspendCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'suspend',
            details: 'Username must be a username that is being used on Roblox. Days can be max 7 and rankBack must ' +
            'be true or false. The reason must be encapsulated in quotes.',
            description: 'Suspends username in the group.',
            examples: ['suspend Happywalker 3 "Spamming the group wall." false', 'suspend Happywalker 3 "Ignoring ' +
            'rules."'],
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
                    prompt: 'How long would you like this suspension to be?',
                    validate: val => {
                        return val < 1 && 'Insufficient amount of days.' || val > 7 && 'Too many days.' || true
                    }
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'For what reason are you suspending this person?'
                },
                {
                    key: 'rankBack',
                    type: 'boolean',
                    prompt: 'Should this person get his old rank back when the suspension finishes?',
                    default: true
                }
            ]
        })
    }

    async execute (message, { username, days, reason, rankBack}) {
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(message.member.displayName)
            await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions`,
                {
                    userId,
                    rankback: rankBack ? 1 : 0,
                    duration: days * 86400,
                    by: byUserId,
                    reason
                })
            message.reply(`Successfully suspended **${username}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
