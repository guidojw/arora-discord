'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const discordService = require('../../services/discord')
const pluralize = require('pluralize')

module.exports = class ReasonCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'reason',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['suspendinfo'],
            description: 'Posts the reason why given username/you is suspended.',
            examples: ['reason', 'reason Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of who would you like to know the suspend reason?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }, guild) {
        if (username && !discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
            return message.reply('Insufficient powers!')
        }
        username = username ||message.member.nickname || message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig
                .groupId}/suspensions/${userId}`)).data
            if (suspension) {
                const days = suspension.duration / 86400
                await message.replyEmbed(discordService.compileRichEmbed([{
                    title: message.argString ? `${username} is suspended for` : 'You\'re suspended for',
                    message: `${days} ${pluralize('day', days)}`
                }, {
                    title: 'Reason',
                    message: `*"${suspension.reason}"*`
                }]))
            } else {
                message.reply('Couldn\'t find suspension!')
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
