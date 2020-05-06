'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class UnixCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'unix',
            aliases: ['epoch'],
            description: 'Posts the current UNIX time.',
            clientPermissions: ['SEND_MESSAGES'],
        })
    }

    execute (message) {
        const embed = new MessageEmbed()
            .addField('Current Unix time', Math.round(Date.now() / 1000))
            .setColor(applicationConfig.primaryColor)
        message.replyEmbed(embed)
    }
}
