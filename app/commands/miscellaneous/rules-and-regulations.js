'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class RulesAndRegulationsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'rr',
            description: 'Posts a link of the Rules & Regulations.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.rulesRegulationsLink)
    }
}
