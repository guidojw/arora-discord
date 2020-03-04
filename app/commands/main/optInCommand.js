'use strict'
const Command = require('../../controllers/command')

module.exports = class OptInCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'optin',
            description: 'Removes your No Training Announcements role so that the #trainings channel becomes visible.',
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
