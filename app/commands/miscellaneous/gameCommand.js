'use strict'
const Command = require('../../controllers/command')

module.exports = class GameCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'game',
            aliases: ['gamepage'],
            description: 'Posts a link of the game.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
