'use strict'
const Command = require('../../controllers/command')

module.exports = class IsInDiscordCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'isindiscord',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if given username is in the Discord guild.',
            examples: ['isindiscord Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to check is the Discord guild?',
                    type: 'string'
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
