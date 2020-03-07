'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')

module.exports = class AgeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'age',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['accountage'],
            description: 'Posts the age of given/your username.',
            examples: ['age', 'age Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which username would you like to know the age?',
                    default: '',
                    type: 'string'
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
