'use strict'
const Command = require('../../controllers/command')

module.exports = class UnbanCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'unban',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['unpban'],
            description: 'Unbans given username.',
            examples: ['unban Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to unban?'
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
