'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const userService = require('../../services/user')
const discordService = require('../../services/discord')

module.exports = class ReasonCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'reason',
            details: 'Username must be a username that is being used on Roblox.',
            aliases: ['suspendinfo'],
            description: 'Posts the reason why given username/you is suspended.',
            examples: ['reason', 'reason Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
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
        if (req.args[0] && !discordService.isAdmin(req.member, req.config.adminRoles)) throw new PermissionError()

        username = username || message.member.nickname !== null ? message.member.nickname : message.author.username
        const userId = await userService.getIdFromUsername(username)
        const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}` +
            `/suspensions/${userId}`)).data
        if (suspension) {
            const days = suspension.duration / 86400
            await req.channel.send(discordService.compileRichEmbed([{
                title: req.args[0] ? `${username} is suspended for`: 'You\'re suspended for',
                message: `${days} ${pluralize('day', days)}`
            }, {
                title: 'Reason',
                message: `*"${suspension.reason}"*`
            }]))
        } else {
            req.channel.send('Couldn\'t find suspension!')
        }
    }
}
