'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const userService = require('../../services/user')
const pluralize = require('pluralize')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class AgeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'age',
            aliases: ['accountage'],
            description: 'Posts the age of given user/you.',
            examples: ['age', 'age Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which user would you like to know the age?',
                    default: '',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof user === 'string' ? username : message.member.displayName
        const userId = await userService.getIdFromUsername(username)
        const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-` +
            'date')).data)
        const age = Math.floor((Date.now() - joinDate.getTime()) / 86400000)
        const embed = new MessageEmbed()
            .addField(`${message.argString ? username + '\'s' : 'Your'} age`,`${age} ${pluralize('day', 
                age)}`)
            .setColor(applicationConfig.primaryColor)
        message.replyEmbed(embed)
    }
}
