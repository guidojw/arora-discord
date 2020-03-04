'use strict'
const Command = require('../../controllers/command')

module.exports = class MemberCountCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'membercount',
            description: 'Posts the current member count of the group.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
