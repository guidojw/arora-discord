'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')

module.exports = class IsDstCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'isdst',
            description: 'Checks if it is daylight savings time.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message) {
        message.reply(timeHelper.isDst(Date.now()))
    }
}
