'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')

module.exports = class ProfileCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'profile',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['playerurl', 'userurl'],
            description: 'Posts the Roblox profile of given/your username.',
            examples: ['profile', 'profile Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which username would you like to know the profile?',
                    default: '',
                    type: 'string'
                }
            ]
        })
    }

    execute (message, { username }) {

    }
}
