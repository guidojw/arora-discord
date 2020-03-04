'use strict'
const Command = require('../../controllers/command')

module.exports = class RulesAndRegulationsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'rr',
            description: 'Posts a link of the Rules & Regulations.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
