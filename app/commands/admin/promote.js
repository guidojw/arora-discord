'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationConfig = require('../../../config/application')
const applicationAdapter = require('../../adapters/application')
const BotEmbed = require('../../views/bot-embed')

module.exports = class PromoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'promote',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Promotes given username in the group.',
            examples: ['promote Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to promote?',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(message.member.displayName)
            await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/promote/${
                userId}`, {
                by: byUserId
            })
            const embed = new BotEmbed()
                .addField(message.command.name, `Successfully promoted **${username}**.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
