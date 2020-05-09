'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')
const { MessageEmbed } = require('discord.js')
const { getTags } = require('../../helpers/string')

const applicationConfig = require('../../../config/application')

module.exports = class PollCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'poll',
            details: 'Use (X) with X being a number from 1-10 in your poll to have the bot automatically react the ' +
            'emojis of these numbers on the poll. If not provided, the bot will react with a checkmark and crossmark.',
            description: 'Posts a poll of given poll to the current channel.',
            examples: ['poll Dogs (1) or cats (2)?'],
            clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES'],
            args: [
                {
                    key: 'poll',
                    type: 'string',
                    prompt: 'What would you like the question to be?',
                    validate: val => getTags(val) ? 'Poll contains tags.' : true
                }
            ]
        })
    }

    async execute (message, { poll }) {
        const options = []
        for (let num = 1; num <= 10; num++) {
            if (message.content.indexOf(`(${num})`) !== -1) {
                options.push(num)
            }
        }
        const embed = new MessageEmbed()
            .setDescription(poll)
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setColor(applicationConfig.primaryColor)
        const newMessage = await message.channel.send(embed)
        if (options.length > 0) {
            for (const option of options) {
                await newMessage.react(discordService.getEmojiFromNumber(option))
            }
        } else {
            await newMessage.react('✔')
            await newMessage.react('✖')
        }
    }
}
