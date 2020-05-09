'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')
const { getDurationString } = require('../../helpers/time')

const applicationConfig = require('../../../config/application')

module.exports = class UptimeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'bot',
            name: 'uptime',
            description: 'Posts the bot\'s uptime.',
            clientPermissions: ['SEND_MESSAGES']
        })
    }

    execute (message) {
        const embed = new MessageEmbed()
            .addField('NSadmin has been online for', getDurationString(this.client.uptime))
            .setColor(applicationConfig.primaryColor)
        message.replyEmbed(embed)
    }
}
