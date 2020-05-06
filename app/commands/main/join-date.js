'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')
const applicationAdapter = require('../../adapters/application')
const { MessageEmbed } = require('discord.js')

module.exports = class JoinDateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'joindate',
            description: 'Posts the join date of given user/you.',
            examples: ['joindate', 'joindate Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which user would you like to know the join date?',
                    default: '',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username ? typeof user === 'string' ? username : username.displayName : message.member.displayName
        try {
            const userId = await userService.getIdFromUsername(username)
            const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-` +
                'date')).data)
            const embed = new MessageEmbed()
                .addField(`${message.argString ? username: 'Your'} join date`, `${timeHelper.getDate(
                    joinDate)}`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
