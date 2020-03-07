'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const discordService = require('../../services/discord')
const userService = require('../../services/user')
const applicationConfig = require('../../../config/application')

module.exports = class UpdateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'update',
            details: 'Username must be a existing nickname in the Discord guild.',
            description: 'Updates the roles of given nickname/you.',
            examples: ['update', 'update @Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'Whose roles would you like to update?',
                    type: 'member',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { nickname }, guild) {
        if (nickname && !discordService.isAdmin(message.member, guild.getData('adminRoles'))) {
            return message.reply('Insufficient powers!')
        }
        let member = !nickname ? message.member : discordService.getMemberByName(guild.guild, nickname)
        if (!member) message.reply(`**${nickname}** is not in this server.`)
        try {
            const userId = await userService.getIdFromUsername(nickname)
            const rank = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/` +
                `rank/${userId}`)).data
            await discordService.updateRoles(guild.guild, member, rank)
            message.reply(`Successfully checked **${nickname}**'s roles.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
