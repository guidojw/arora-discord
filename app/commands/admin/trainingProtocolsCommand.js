'use strict'
const Command = require('../../controllers/command')

module.exports = class TrainingProtocolsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'trainingprotocols',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['tp'],
            description: 'Posts a link of the Training Protocols.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
