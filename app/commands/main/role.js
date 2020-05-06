'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const userService = require('../../services/user')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class RoleCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'role',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['getrole'],
            description: 'Posts the group role of given username/you.',
            examples: ['role', 'role Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of which username would you like to know the group role?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const role = (await applicationAdapter('get', `/v1/users/${userId}/role/${
                applicationConfig.groupId}`)).data
            const embed = new MessageEmbed()
                .addField(`${message.argString ? username + '\'s' : 'Your'} role`, role)
                .setColor(applicationConfig.primaryColor)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
