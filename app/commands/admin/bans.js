'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const discordService = require('../../services/discord')

module.exports = class BansCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'bans',
            aliases: ['banlist', 'pbanlist'],
            description: 'Lists all bans.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message) {
        try {
            const bans = (await applicationAdapter('get', '/v1/bans')).data
            if (bans.length === 0) return message.reply('There are currently no bans.')
            const embeds = await discordService.getBanEmbeds(bans)
            for (const embed of embeds) {
                await message.author.send(embed)
            }
            message.reply('Sent you a DM with the banlist.')
        } catch (err) {
            message.reply(err.message)
        }
    }
}
