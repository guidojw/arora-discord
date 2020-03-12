'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')
const BotEmbed = require('../../views/botEmbed')

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
        const embed = new BotEmbed()
            .addField(message.command.name, timeHelper.getUnix())
        message.replyEmbed(embed)
    }
}
