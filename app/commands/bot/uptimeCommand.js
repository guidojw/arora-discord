'use strict'
const Command = require('../../controllers/command')

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

    }
}
