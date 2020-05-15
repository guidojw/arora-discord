'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class RankCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'rank',
            aliases: ['getrank'],
            description: 'Posts the group rank of given user/you.',
            examples: ['rank', 'rank Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'member|string',
                    prompt: 'Of which user would you like to know the group rank?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof username === 'string' ? username : username.displayName : message.member
            .displayName
        const userId = await userService.getIdFromUsername(username)
        const rank = await userService.getRank(userId, applicationConfig.groupId)
        const embed = new MessageEmbed()
            .addField(`${message.argString ? username + '\'s' : 'Your'} rank`, rank)
            .setColor(applicationConfig.primaryColor)
        message.replyEmbed(embed)
    }
}
