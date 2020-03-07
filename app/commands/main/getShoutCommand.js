'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')

module.exports = class GetShoutCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'getshout',
            description: 'Gets the current group shout.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
