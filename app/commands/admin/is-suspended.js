'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')

module.exports = class IsSuspendedCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'issuspended',
            details: 'Username must be a username that is being used on Roblox.',
            description: 'Checks if you/given username is suspended.',
            examples: ['issuspended Happywalker'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to know is suspended?',
                    type: 'string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        try {
            const userId = await userService.getIdFromUsername(username)
            const suspension = (await applicationAdapter('get', `/v1/groups/${applicationConfig
                .groupId}/suspensions/${userId}`)).data
            if (suspension) {
                message.reply(`Yes, **${username}** is suspended.`)
            } else {
                message.reply(`No, **${username}** is not suspended.`)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
