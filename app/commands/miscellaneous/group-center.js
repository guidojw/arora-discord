'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class GroupCenterCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'groupcenter',
            aliases: ['gc'],
            description: 'Posts a link of the Group Center.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.groupCenterLink)
    }
}
