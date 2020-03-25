'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const discordService = require('../../services/discord')
const applicationConfig = require('../../../config/application')

module.exports = class SuspensionsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'suspensions',
            aliases: ['suspensionlist'],
            description: 'Lists all current suspensions.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message) {
        try {
            const suspensions = (await applicationAdapter('get', `/v1/groups/${applicationConfig
                .groupId}/suspensions`)).data
            if (suspensions.length === 0) return message.reply('There are currently no suspensions.')
            const embeds = await discordService.getSuspensionEmbeds(suspensions)
            for (const embed of embeds) {
                await message.author.send(embed)
            }
            message.reply('Sent you a DM with the current suspensions.')
        } catch (err) {
            message.reply(err.message)
        }
    }
}
