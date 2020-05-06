'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class MemberCountCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'miscellaneous',
            name: 'membercount',
            description: 'Posts the current member count of the group.',
            clientPermissions: ['SEND_MESSAGES'],
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
        const embed = new MessageEmbed()
            .addField(`${group.name}'s member count`, group.memberCount)
            .setColor(applicationConfig.primaryColor)
        message.replyEmbed(embed)
    }
}
