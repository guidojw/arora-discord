'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const BotEmbed = require('../../views/bot-embed')

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
        username = username || message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const role = (await applicationAdapter('get', `/v1/users/${userId}/rank/${
                applicationConfig.groupId}`)).data
            const embed = new BotEmbed()
                .addField(message.command.name, `**${username}** has rank **${role}**.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
