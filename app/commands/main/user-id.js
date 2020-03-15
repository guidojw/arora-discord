'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const BotEmbed = require('../../views/bot-embed')

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
            const embed = new BotEmbed()
                .addField(message.command.name, `**${username}** has userId **${userId}**.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
