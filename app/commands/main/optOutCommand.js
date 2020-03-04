'use strict'
const Command = require('../../controllers/command')

module.exports = class OptOutCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'optout',
            description: 'Gives you the No Training Announcements role so that the #trainings channel becomes hidden.',
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
