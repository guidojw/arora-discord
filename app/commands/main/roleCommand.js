'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const BotEmbed = require('../../views/botEmbed')

module.exports = class RoleCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'role',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getrole'],
            description: 'Posts the group role of given username/you.',
            examples: ['role', 'role Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of which username would you like to know the group role?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.nickname || message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const role = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/` +
                `role/${userId}`)).data
            const embed = new BotEmbed()
                .addField(message.command.name, `**${username}** has role **${role}**.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
