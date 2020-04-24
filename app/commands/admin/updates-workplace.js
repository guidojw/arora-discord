'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class UpdatesWorkplaceCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'updatesworkplace',
            aliases: ['uw'],
            description: 'Posts a link of the Updates Workplace.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.updatesWorkplaceLink)
    }
}
