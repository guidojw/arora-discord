'use strict'
const Command = require('../../controllers/command')

module.exports = class MaliciousSpreadsheetsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'maliciousspreadsheets',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['ml'],
            description: 'Posts a link of the Malicious Spreadsheets.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
