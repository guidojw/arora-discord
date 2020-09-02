'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')
const { TicketState } = require('../../controllers/ticket')

module.exports = class SubmitReportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'submitreport',
            aliases: ['submit'],
            description: 'Submits entered report.',
            clientPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'SEND_MESSAGES'],
            guildOnly: false
        })
    }

    async execute (message, _args, guild) {
        // Command can only be used in private messages
        if (!guild) {

            const ticketsController = this.client.bot.ticketsController
            const ticketController = ticketsController.tickets[message.author.id]
            if (ticketController) {

                // If user is currently entering a report
                if (ticketController.state === TicketState.SUBMITTING_REPORT) {
                    const prompt = await message.channel.send('Are you sure you want to submit your report?')
                    const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅',
                        '🚫']) === '✅'

                    if (choice) {
                        ticketController.submit()
                    }

                } else {
                    message.reply('You\'re not currently filing a report.')
                }

            } else {
                message.reply('You have no open tickets.')
            }

        } else {
            return message.reply('This command can only be used in channels in the tickets category.')
        }
    }
}
