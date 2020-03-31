'use strict'
require('dotenv').config()

const Command = require('../../controllers/command')

module.exports = class TrainingProtocolsCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'trainingprotocols',
            details: 'This command can only be run in the #hr channel.',
            aliases: ['tp'],
            description: 'Posts a link of the Training Protocols.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    hasPermission (message) {
        const guild = this.client.bot.getGuild(message.guild.id)
        const channels = guild.getData('channels')
        return message.channel.id === channels.hrChannel || message.channel.id === channels.botCommandsHrChannel ? super
            .hasPermission(message) : 'Wrong channel.'
    }

    execute (message) {
        message.reply(`<${process.env.TP_DOC}>`)
    }
}
