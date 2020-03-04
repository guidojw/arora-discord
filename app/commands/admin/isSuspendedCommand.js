'use strict'
const Command = require('../../controllers/command')

module.exports = class IsSuspendedCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'issuspended',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if you/given username is suspended.',
            examples: ['issuspended', 'issuspended Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to know is suspended?',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
