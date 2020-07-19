'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

module.exports = class CloseTicketCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'closeticket',
            aliases: ['close'],
            description: 'Closes this ticket.',
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_CHANNELS']
        })
    }

    async execute (message, _args, guild) {
        const channels = guild.getData('channels')
        if (message.channel.parentID !== channels.ticketsCategory) {
            return message.reply('This command can only be used in channels in the tickets category.')
        }

        const prompt = await message.channel.send('Are you sure you want to close this ticket?')
        const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) === '✅'

        if (choice) {
            await message.channel.delete()
        }
    }
}
