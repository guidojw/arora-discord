'use strict'
const Command = require('../../controllers/command')
const { MessageEmbed } = require('discord.js')
const userService = require('../../services/user')

const applicationConfig = require('../../../config/application')

module.exports = class BadgesCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'badges',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if given username/you has the training badges.',
            examples: ['badges', 'badges Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of who would you like to know the suspend reason?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const hasTtdt = await userService.hasBadge(userId, applicationConfig.ttdtId)
            const hasPtdt = await userService.hasBadge(userId, applicationConfig.ptdtId)
            const hasTcdt = await userService.hasBadge(userId, applicationConfig.tcdtId)
            const embed = new MessageEmbed()
                .setTitle(`${message.argString ? username + '\'s' : 'Your'} badges`)
                .addField('TTDT', hasTtdt ? 'yes' : 'no', true)
                .addField('PTDT', hasPtdt ? 'yes' : 'no', true)
                .addField('TCDT', hasTcdt ? 'yes' : 'no', true)
                .setColor(applicationConfig.primaryColor)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
