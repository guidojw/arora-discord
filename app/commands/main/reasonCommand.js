'use strict'
const Command = require('../../controllers/command')

module.exports = class ReasonCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'reason',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['suspendinfo'],
            description: 'Posts the reason why given username/you is suspended.',
            examples: ['reason', 'reason Happywalker'],
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
