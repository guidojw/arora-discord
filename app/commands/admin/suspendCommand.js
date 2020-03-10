'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const discordService = require('../../services/discord')
const applicationConfig = require('../../../config/application')
const applicationAdapter = require('../../adapters/application')

module.exports = class SuspendCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'suspend',
            details: 'Username must be a username that is being used on Roblox. Days can be max 7 and rankBack must ' +
            'be true or false.',
            description: 'Suspends username in the group.',
            examples: ['suspend Happywalker 3 false Spamming the group wall.', 'suspend Happywalker 3 Ignoring the ' +
            'rules'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to unban?'
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
                    key: 'rankBack',
                    type: 'boolean',
                    prompt: 'Should this person get his old rank back when the suspension finishes?',
                    default: true
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'For what reason are you suspending this person?'
                }
            ]
        })
    }

    async execute (message, { username, days, rankBack, reason}) {
        const byUsername = message.member.nickname || message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(byUsername)
            await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/suspensions`,
                {
                    userId: userId,
                    rankback: rankBack,
                    duration: days * 86400,
                    by: byUserId,
                    reason: reason
                })
            message.replyEmbed(discordService.getEmbed(message.command.name, `Successfully suspended **${username
            }**.`))
        } catch (err) {
            message.reply(err.message)
        }
    }
}
