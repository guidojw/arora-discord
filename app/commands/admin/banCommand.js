'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const BotEmbed = require('../../views/botEmbed')

module.exports = class BanCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'ban',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['pban'],
            description: 'Bans given username.',
            examples: ['unban Happywalker He apologized.'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Who would you like to ban?'
                },
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'With what reason would you like to unban this person?'
                }
            ]
        })
    }

    async execute (message, { username, reason }) {
        const byUsername = message.member.nickname || message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const byUserId = await userService.getIdFromUsername(byUsername)
            await applicationAdapter('post', `/v1/bans`, {
                userId: userId,
                by: byUserId,
                reason: reason,
                groupId: applicationConfig.groupId
            })
            const embed = new BotEmbed()
                .addField(message.command.name, `Successfully banned **${username}**.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
