'use strict'
const Command = require('../../controllers/command')

module.exports = class BadgesCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'badges',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if given username/you has the training badges.',
            examples: ['badges', 'badges Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of who would you like to know the suspend reason?',
                    default: ''
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
