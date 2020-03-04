'use strict'
const Command = require('../../controllers/command')

module.exports = class RankCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'rank',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getrank'],
            description: 'Posts the group rank of given username/you.',
            examples: ['rank', 'rank Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of which username would you like to know the group rank?',
                    default: ''
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
