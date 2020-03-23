'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const { MessageEmbed } = require('discord.js')

module.exports = class UserIdCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'userid',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getuserid'],
            description: 'Posts the user ID of given/your username.',
            examples: ['userid', 'userid Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which username would you like to know the user ID?',
                    default: '',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const embed = new MessageEmbed()
                .addField(`${message.argString ? username + '\'s' : 'Your'} user ID`, userId)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
