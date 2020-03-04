'use strict'
const Command = require('../../controllers/command')

module.exports = class ActivitiesCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'activities',
            aliases: ['statuses'],
            description: 'Lists all activities.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
