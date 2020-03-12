'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')
const discordService = require('../../services/discord')

module.exports = class UpTimeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'bot',
            name: 'uptime',
            description: 'Posts the bot\'s uptime.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {
        message.replyEmbed(discordService.getEmbed('NSadmin has been online for', `${Math.round(this
            .client.uptime / 1000)}s`))
    }
}
