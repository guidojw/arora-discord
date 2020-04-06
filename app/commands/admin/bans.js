'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const discordService = require('../../services/discord')
const userService = require('../../services/user')
const timeHelper = require('../../helpers/time')
const { MessageEmbed } = require('discord.js')

module.exports = class BansCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'admin',
            name: 'bans',
            aliases: ['banlist', 'baninfo'],
            description: 'Lists info of current bans/given username\'s ban.',
            clientPermissions: ['SEND_MESSAGES'],
            args: [
                {
                    key: 'username',
                    type: 'string',
                    prompt: 'Of whose ban would you like to know the information?',
                    default: ''
                }
            ]
        })
    }

    async execute (message, { username }) {
        try {
            if (username) {
                const userId = await userService.getIdFromUsername(username)
                const ban = (await applicationAdapter('get', `/v1/bans/${userId}`)).data
                const embed = new MessageEmbed()
                    .setTitle(`${message.argString ? `${username}'s` : 'Your'} ban`)
                if (ban.at) {
                    embed.addField('Start date', timeHelper.getDate(ban.at * 1000), true)
                    embed.addField('Start time', timeHelper.getTime(ban.at * 1000), true)
                }
                if (ban.reason) {
                    embed.addField('Reason', ban.reason)
                }
                message.replyEmbed(embed)
            } else {
                const bans = (await applicationAdapter('get', '/v1/bans')).data
                if (bans.length === 0) return message.reply('There are currently no bans.')
                const embeds = await discordService.getBanEmbeds(bans)
                for (const embed of embeds) {
                    await message.author.send(embed)
                }
                message.reply('Sent you a DM with the banlist.')
            }

        } catch (err) {
            message.reply(err.message)
        }
    }
}
