'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const applicationConfig = require('../../../config/application')
const BotEmbed = require('../../views/bot-embed')

module.exports = class MemberCountCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'membercount',
            description: 'Posts the current member count of the group.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'groupId',
                    type: 'integer',
                    prompt: 'From what group would you like to know the member count?',
                    default: applicationConfig.groupId
                }
            ]
        })
    }

    async execute (message, { groupId }) {
        const group = (await applicationAdapter('get', `/v1/groups/${groupId}`)).data
        const embed = new BotEmbed()
            .addField(`${group.name} has`, `**${group.memberCount}** members.`)
        message.replyEmbed(embed)
    }
}
