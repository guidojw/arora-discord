'use strict'
const Command = require('../../controllers/command')

module.exports = class GroupCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'group',
            aliases: ['grouplink', 'grouppage'],
            description: 'Posts a link of the group.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
