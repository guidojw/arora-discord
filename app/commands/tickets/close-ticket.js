'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')
const { TicketState } = require('../../controllers/ticket')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../../config/application')

module.exports = class CloseTicketCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'closeticket',
            aliases: ['close'],
            description: 'Closes this ticket.',
            clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES', 'MANAGE_CHANNELS'],
            guildOnly: false
        })
    }

    async execute (message, _args, guild) {
        const ticketsController = this.client.bot.ticketsController

        // If executed in a guild
        if (guild) {
            // Check if the channel is actually a ticket channel
            const channels = guild.getData('channels')
            if (message.channel.parentID !== channels.ticketsCategory) {
                return message.reply('This command can only be used in channels in the tickets category.')
            }

            // Prompt the user if they really want to close the ticket
            const prompt = await message.channel.send('Are you sure you want to close this ticket?')
            const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫'])
                === '✅'

            if (choice) {
                // Get the channel's TicketController
                const ticketController = ticketsController.getTicketFromChannel(message.channel)

                // Log the action
                await this.client.bot.log(message.author, stripIndents`
                        ${message.author} **closed ticket** \`${ticketController.id}\`
                        ${message.content}
                        `, `Ticket ID: ${ticketController.id}`)

                return ticketController.close('The moderator has closed this ticket.', true, applicationConfig
                    .primaryColor)
            }

        // If executed in DMs
        } else {
            const ticketController = ticketsController.getTicketFromAuthor(message.author)
            // Tickets can only be closed between the submitting report and the connected states
            if (ticketController && (ticketController.state === TicketState.SUBMITTING_REPORT || ticketController.state
                === TicketState.CREATING_CHANNEL || ticketController.state === TicketState.CONNECTED)) {

                const prompt = await message.channel.send('Are you sure you want to close this ticket?')
                const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅',
                    '🚫']) === '✅'

                if (choice) {
                    // Log the action
                    await this.client.bot.log(message.author, stripIndents`
                        ${message.author} **closed ticket** \`${ticketController.id}\`
                        ${message.content}
                        `, `Ticket ID: ${ticketController.id}`)

                    return ticketController.close('Ticket successfully closed.', false, applicationConfig.primaryColor)
                }

            } else {
                return message.reply('You have no open tickets.')
            }
        }
    }
}
