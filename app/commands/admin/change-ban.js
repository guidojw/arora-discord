'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')

module.exports = class ChangeBanCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changeban',
            details: 'Username must be a username that is being used on Roblox. Key must be by or reason. You can ' +
                'only change the by key of bans you created.',
            description: 'Changes given username\'s ban\'s key to given data.',
            examples: ['changeban Happywalker by builderman'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose ban would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['by', 'reason']
                },
                {
                    key: 'data',
                    type: 'string',
                    prompt: 'What would you like to change this key\'s data to?'
                }
            ]
        })
    }

    async execute (message, { username, key, data }) {
        key = key.toLowerCase()
        const changes = {}
        try {
            if (key === 'by') {
                changes.by = await userService.getIdFromUsername(data)
            } else if (key === 'reason') {
                changes.reason = data
            }
            changes.byUserId = await userService.getIdFromUsername(message.member.displayName)
            const userId = await userService.getIdFromUsername(username)
            await applicationAdapter('put', `/v1/bans/${userId}`, changes)
            message.reply(`Successfully changed **${username}**'s ban.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
