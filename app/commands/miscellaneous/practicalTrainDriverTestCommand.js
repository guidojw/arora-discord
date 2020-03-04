'use strict'
const Command = require('../../controllers/command')

module.exports = class PracticalTrainDriverTestCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'ptdt',
            description: 'Posts a link of the Practical Train Driver Test II.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
