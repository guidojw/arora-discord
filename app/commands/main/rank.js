'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const { MessageEmbed } = require('discord.js')

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
        username = username ? typeof user === 'string' ? username : username.displayName : message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const rank = (await applicationAdapter('get', `/v1/users/${userId}/rank/${
                applicationConfig.groupId}`)).data
            const embed = new MessageEmbed()
                .addField(`${message.argString ? username + '\'s' : 'Your'} rank`, rank)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
