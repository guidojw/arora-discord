'use strict'
const Command = require('../../controllers/command')

module.exports = class UnixCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'unix',
            aliases: ['epoch'],
            description: 'Posts the current UNIX time.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
        })
    }

    execute (message) {

    }
}
