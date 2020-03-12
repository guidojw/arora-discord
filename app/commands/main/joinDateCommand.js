'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')
const applicationAdapter = require('../../adapters/application')
const BotEmbed = require('../../views/botEmbed')

module.exports = class JoinDateCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'joindate',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Posts the join date of given/your username.',
            examples: ['joindate', 'joindate Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Of which username would you like to know the join date?',
                    default: '',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        username = username || message.member.nickname || message.author.username
        try {
            const userId = await userService.getIdFromUsername(username)
            const joinDate = new Date((await applicationAdapter('get', `/v1/users/${userId}/join-` +
                'date')).data)
            const embed = new BotEmbed()
                .addField(message.command.name, `${message.argString ? '**' + username + '**' : 'You'} joined ` +
                    `Roblox on **${timeHelper.getDate(timeHelper.getUnix(joinDate) * 1000)}**.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
