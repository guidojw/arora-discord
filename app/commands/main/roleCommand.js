'use strict'
const Command = require('../../controllers/command')

module.exports = class RoleCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'role',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getrole'],
            description: 'Posts the group role of given username/you.',
            examples: ['role', 'role Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of which username would you like to know the group role?',
                    default: ''
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
