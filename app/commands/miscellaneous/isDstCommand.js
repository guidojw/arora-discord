'use strict'
const Command = require('../../controllers/command')

module.exports = class IsDstCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'isdst',
            description: 'Checks if it is daylight savings time.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
