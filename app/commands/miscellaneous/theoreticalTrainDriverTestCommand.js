'use strict'
const Command = require('../../controllers/command')

module.exports = class TheoreticalTrainDriverTestCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'ttdt',
            description: 'Posts a link of the Theoretical Train Driver Test II.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {

    }
}
