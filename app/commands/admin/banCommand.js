'use strict'
const Command = require('../../controllers/command')

module.exports = class BanCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'ban',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['pban'],
            description: 'Bans given username.',
            examples: ['unban Happywalker He apologized.'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to ban?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to unban this person?'
                }
            ]
        })
    }

    execute (message, { username, reason }) {

    }
}
