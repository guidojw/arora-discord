'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class InviteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'invite',
            aliases: ['discord'],
            description: 'Posts the invite to the Dutch Railways Discord server.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.discordLink)
    }
}
