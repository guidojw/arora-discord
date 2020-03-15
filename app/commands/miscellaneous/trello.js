'use strict'
const Command = require('../../controllers/command')
const applicationConfig = require('../../../config/application')

module.exports = class TrelloCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'trello',
            description: 'Posts a link of the Trello Dev Board.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {
        message.reply(applicationConfig.trelloLink)
    }
}
