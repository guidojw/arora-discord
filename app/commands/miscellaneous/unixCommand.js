'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')
const discordService = require('../../services/discord')

module.exports = class UnixCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'unix',
            aliases: ['epoch'],
            description: 'Posts the current UNIX time.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
        })
    }

    execute (message) {
        message.replyEmbed(discordService.getEmbed(message.command.name, timeHelper.getUnix()))
    }
}
