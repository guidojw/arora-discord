'use strict'
const Command = require('../../controllers/command')

module.exports = class InviteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'invite',
            aliases: ['discord'],
            description: 'Posts the invite to the Dutch Railways Discord guild.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
