'use strict'
const Command = require('../../controllers/command')

module.exports = class GroupCenterCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'groupcenter',
            aliases: ['gc'],
            description: 'Posts a link of the Group Center.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
