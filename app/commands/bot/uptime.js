'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')

module.exports = class UptimeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'bot',
            name: 'uptime',
            description: 'Posts the bot\'s uptime.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {
        const embed = new MessageEmbed()
            .addField('NSadmin has been online for', `${Math.round(this.client.uptime / 1000)}s`)
        message.replyEmbed(embed)
    }
}
