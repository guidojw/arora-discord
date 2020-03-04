'use strict'
const Command = require('../../controllers/command')

module.exports = class PromoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'promote',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Promotes given username in the group.',
            examples: ['promote Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to promote?',
                    type: 'string'
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
