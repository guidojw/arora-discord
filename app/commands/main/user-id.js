'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const { MessageEmbed } = require('discord.js')

module.exports = class UserIdCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'userid',
            aliases: ['getuserid'],
            description: 'Posts the user ID of given user/you.',
            examples: ['userid', 'userid Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which user would you like to know the user ID?',
                    default: '',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof user === 'string' ? username : username.displayName : message.member.displayName
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
