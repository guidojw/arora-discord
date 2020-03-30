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
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getrank'],
            description: 'Posts the group rank of given username/you.',
            examples: ['rank', 'rank Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of which username would you like to know the group rank?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.displayName
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
