'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const discordService = require('../../services/discord')

module.exports = class RankCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'rank',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getrank'],
            description: 'Posts the group rank of given username/you.',
            examples: ['rank', 'rank Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of which username would you like to know the group rank?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.nickname !== null ? message.member.nickname : message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const role = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/` +
                `rank/${userId}`)).data
            message.replyEmbed(discordService.getEmbed(message.command.name, `**${username}** has rank **${role
            }**.`))
        } catch (err) {
            message.reply(err.message)
        }
    }
}
