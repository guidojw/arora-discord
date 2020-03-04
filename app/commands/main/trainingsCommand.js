'use strict'
const Command = require('../../controllers/command')

module.exports = class TrainingsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'trainings',
            aliases: ['traininglist'],
            description: 'Lists all scheduled trainings.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
