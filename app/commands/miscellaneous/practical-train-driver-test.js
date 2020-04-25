'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class PracticalTrainDriverTestCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'ptdt',
            description: 'Posts a link of the Practical Train Driver Test II.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.practicalTrainDriverTestLink)
    }
}
