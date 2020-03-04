'use strict'
const Command = require('../../controllers/command')

module.exports = class NotDutchCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'notdutch',
            description: 'Gives you the Not Dutch role so that the #dutchland channel becomes hidden.',
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
