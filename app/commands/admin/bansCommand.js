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
            const embeds = discordService.getBanEmbeds(bans)
            embeds[0].setTitle('Bans')
            for (const embed of embeds) {
                await message.author.send(embed)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
