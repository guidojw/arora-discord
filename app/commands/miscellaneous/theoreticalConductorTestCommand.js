'use strict'
const Command = require('../../controllers/command')

module.exports = class TheoreticalConductorTestCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'tcdt',
            description: 'Posts a link of the Theoretical Conductor Test.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
