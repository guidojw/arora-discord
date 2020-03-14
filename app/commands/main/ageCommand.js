'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')
const pluralize = require('pluralize')
const BotEmbed = require('../../views/botEmbed')

module.exports = class AgeCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'age',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['accountage'],
            description: 'Posts the age of given/your username.',
            examples: ['age', 'age Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
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
            const age = Math.floor((timeHelper.getUnix() - timeHelper.getUnix(joinDate)) / 86400)
            const embed = new BotEmbed()
                .addField(message.command.name, `${message.argString ? '**' + username + '**\'s' : 'Your'} ` +
                    `Roblox account is **${age} ${pluralize('day', age)}** old.`)
            message.replyEmbed(embed)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
