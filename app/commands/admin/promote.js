'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationConfig = require('../../../config/application')
const applicationAdapter = require('../../adapters/application')

module.exports = class PromoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'promote',
            description: 'Promotes given user in the group.',
            examples: ['promote Happywalker'],
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    prompt: 'Who would you like to promote?',
                    type: 'member|string'
                }
            ]
        })
    }

    async execute (message, { username }) {
        try {
            username = typeof user === 'string' ? username : username.displayName
            const [userId, authorId] = await Promise.all([userService.getIdFromUsername(username), userService
                .getIdFromUsername(message.member.displayName)])
            const roles = (await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId
            }/promote/${userId}`, { authorId })).data
            message.reply(`Successfully promoted **${username}** from **${roles.oldRole.name}** to **${roles.newRole
                .name}**.`)
        } catch (err) {
            message.reply(err.message)
        }
    }
}
