'use strict'
const Command = require('../../controllers/command')
const userService = require('../../services/user')
const applicationConfig = require('../../../config/application')
const applicationAdapter = require('../../adapters/application')
const { MessageEmbed } = require('discord.js')

module.exports = class ShoutCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'shout',
            details: 'Shout can be either a message or "clear". When it\'s clear, the group shout will be cleared.',
            description: 'Posts shout with given shout to the group.',
            examples: ['shout Happywalker is awesome', 'shout clear'],
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'shout',
                    type: 'string',
                    prompt: 'What would you like to shout?',
                    validate: val => {
                        return val.length <= 255 || 'Can\'t post shout, it\'s too long.'
                    }
                }
            ]
        })
    }

    async execute (message, { shout }) {
        try {
            const byUserId = await userService.getIdFromUsername(message.member.displayName)
            await applicationAdapter('post', `/v1/groups/${applicationConfig.groupId}/shout`, {
                by: byUserId,
                message: shout === 'clear' ? '' : shout
            })
            if (shout === 'clear') {
                message.reply('Successfully cleared shout.')
            } else {
                const embed = new MessageEmbed()
                    .addField('Successfully shouted', shout)
                message.replyEmbed(embed)
            }
        } catch (err) {
            message.reply(err.message)
        }
    }
}
