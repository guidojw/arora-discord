'use strict'
const Command = require('../../controllers/command')

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

    execute (message) {

    }
}
