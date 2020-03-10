'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')

module.exports = class ChangeSuspensionCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'changesuspension',
            details: 'Username must be a username that is being used on Roblox. RankBack must be true or false. Key ' +
            'must be by, reason or rankBack. You can only the by key of suspensions you created.',
            description: 'Changes given username\'s suspension\'s key to given data.',
            examples: ['changesuspension Happywalker rankBack false'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Whose suspension would you like to change?'
                },
                {
                    key: 'key',
                    type: 'string',
                    prompt: 'What key would you like to change?',
                    oneOf: ['by', 'reason', 'rankBack']
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
        const newData = {}
        try {
            if (key === 'by') {
                newData.by = await userService.getIdFromUsername(data)
            } else if (key === 'reason') {
                newData.reason = data
            } else if (key === 'rankBack') {
                if (data !== 'true' && data !== 'false') return message.reply(`**${data}** is not a valid value for ` +
                    'rankBack.')
                data.rankback = data === 'true'
            }
            const userId = await userService.getIdFromUsername(username)
            const suspension = (await applicationAdapter('put', `/v1/groups/${applicationConfig
                    .groupId}/suspensions/${userId}`, newData)).data
            if (suspension) {
                message.reply(`Successfully changed **${username}**'s suspension.`)
            } else {
                message.reply(`Couldn't change **${username}**'s suspension.`)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
