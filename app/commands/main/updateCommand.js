'use strict'
const Command = require('../../controllers/command')

module.exports = class UpdateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'update',
            details: 'Username must be a existing nickname in the Discord guild.',
            description: 'Updates the roles of given nickname/you.',
            examples: ['update', 'update @Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'MANAGE_ROLES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'Whose roles would you like to update?',
                    type: 'member',
                    default: ''
                }
            ]
        })
    }

    execute (message, { nickname }) {

    }
}
