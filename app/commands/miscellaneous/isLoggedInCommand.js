'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')

module.exports = class IsLoggedInCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'isloggedin',
            description: 'Posts the backend\'s Roblox login status.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message) {
        try {
            message.reply((await applicationAdapter('get', '/v1/status')).data)
        } catch (err) {
            message.reply(false)
        }
    }
}
