'use strict'
const Command = require('../../controllers/command')

module.exports = class IsAdminCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'isadmin',
            details: 'Nickname must be a existing nickname in the Discord guild.',
            aliases: ['amiadmin'],
            description: 'Checks if you/given nickname is admin.',
            examples: ['isadmin', 'isadmin @Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'nickname',
                    prompt: 'Who would you like to check is admin?',
                    type: 'member',
                    default: ''
                }
            ]
        })
    }

    execute (message, { nickname }) {

    }
}
