'use strict'
require('dotenv').config()

const Command = require('../../controllers/command')

module.exports = class TrainingLogsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'traininglogs',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['tl'],
            description: 'Posts a link of the Training Logs.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    hasPermission (message) {
        const guild = this.client.bot.getGuild(message.guild.id)
        return message.channel.id === guild.getData('channels').hrChannel ? super.hasPermission(message) : 'Wrong ' +
            'channel.'
    }

    execute (message) {
        message.reply(`<${process.env.TL_DOC}>`)
    }
}
