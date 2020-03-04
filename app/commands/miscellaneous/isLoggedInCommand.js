'use strict'
const Command = require('../../controllers/command')

module.exports = class IsLoggedInCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'isloggedin',
            description: 'Posts the backend\'s Roblox login status.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
