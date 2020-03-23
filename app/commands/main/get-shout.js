'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const { MessageEmbed } = require('discord.js')

module.exports = class GetShoutCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'getshout',
            description: 'Gets the current group shout.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    async execute (message) {
        const shout = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/` +
            'shout')).data
        if (shout.body) {
            const embed = new MessageEmbed()
                .addField(`Current shout by ${shout.poster.username}`, shout.body)
                .setTimestamp(shout.updated)
            message.replyEmbed(embed)
        } else {
            message.reply('There currently is no shout.')
        }
    }
}
