'use strict'
const Command = require('../../controllers/command')
const BotEmbed = require('../../views/bot-embed')

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
            .addField(message.command.name, Math.round(Date.now() / 1000))
        message.replyEmbed(embed)
    }
}
