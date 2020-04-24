'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class TheoreticalTrainDriverTestCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'ttdt',
            description: 'Posts a link of the Theoretical Train Driver Test II.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.theoreticalTrainDriverTestLink)
    }
}
