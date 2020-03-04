'use strict'
const Command = require('../../controllers/command')

module.exports = class JoinDateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'joindate',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Posts the join date of given/your username.',
            examples: ['joindate', 'joindate Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which username would you like to know the join date?',
                    default: '',
                    type: 'string'
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
