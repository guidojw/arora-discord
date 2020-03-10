'use strict'
require('dotenv').config()

const Command = require('../../controllers/command')

module.exports = class DocumentsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'documents',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['docs'],
            description: 'Posts links of the HR documents.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    hasPermission (message) {
        const guild = this.client.bot.guilds[message.guild.id]
        return message.channel.id === guild.getData('channels').hrChannel ? super.hasPermission(message) : 'Wrong ' +
            'channel.'
    }

    execute (message) {
        message.reply(`<${process.env.TP_DOC}>`)
        message.reply(`<${process.env.TL_DOC}>`)
        message.reply(`<${process.env.MS_DOC}>`)
    }
}
