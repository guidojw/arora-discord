'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const userService = require('../../services/user')
const pluralize = require('pluralize')
const { MessageEmbed } = require('discord.js')

module.exports = class AgeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'age',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['accountage'],
            description: 'Posts the age of given/your username.',
            examples: ['age', 'age Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which username would you like to know the age?',
                    default: '',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-` +
                'date')).data)
            const age = Math.floor((Date.now() - joinDate.getTime()) / 86400000)
            const embed = new MessageEmbed()
                .addField(`${message.argString ? username + '\'s' : 'Your'} age`,
                    `${age} ${pluralize('day', age)}`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
