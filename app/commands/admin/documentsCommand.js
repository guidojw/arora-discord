'use strict'
const Command = require('../../controllers/command')

module.exports = class DocumentsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'documents',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['docs'],
            description: 'Posts links of the HR documents.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
