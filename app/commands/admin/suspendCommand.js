'use strict'
const Command = require('../../controllers/command')

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
                    prompt: 'How long would you like this suspension to be?'
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

    execute (message, { username, days, rankBack, reason}) {

    }
}
