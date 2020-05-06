'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')

module.exports = class ProfileCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'profile',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['playerurl', 'userurl', 'url'],
            description: 'Posts the Roblox profile of given/your username.',
            examples: ['profile', 'profile Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
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

    async execute (message, { username }) {
        const userId = await userService.getIdFromUsername(username || message.member.displayName)
        message.reply(`https://www.roblox.com/users/${userId}/profile`)
    }
}
