'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')

module.exports = class ProfileCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'profile',
            aliases: ['playerurl', 'userurl', 'url'],
            description: 'Posts the Roblox profile of given user/you.',
            examples: ['profile', 'profile Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which user would you like to know the profile?',
                    default: '',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof user === 'string' ? username : username.displayName : message.member.displayName
        const userId = await userService.getIdFromUsername(username || message.member.displayName)
        message.reply(`https://www.roblox.com/users/${userId}/profile`)
    }
}
