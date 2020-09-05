'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')
const { TicketState } = require('../../controllers/ticket')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class SubmitReportCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'tickets',
            name: 'submitreport',
            aliases: ['submit'],
            description: 'Submits entered report.',
            clientPermissions: ['ADD_REACTIONS', 'SEND_MESSAGES'],
            guildOnly: false
        })
    }

    async execute (message, _args, guild) {
        // Command can only be used in private messages
        if (!guild) {

            const ticketsController = this.client.bot.ticketsController
            const ticketController = ticketsController.getTicketFromAuthor(message.author)
            if (ticketController) {

                // If user is currently entering a report
                if (ticketController.state === TicketState.SUBMITTING_REPORT) {

                    // Tell the user they have to send messages first
                    if (ticketController.report.length === 0) {
                        const embed = new MessageEmbed()
                            .setColor(applicationConfig.primaryColor)
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                            .setTitle('Can\'t submit report')
                            .setDescription('Please add messages first.')
                        return message.channel.send(embed)
                    }

                    const prompt = await message.channel.send('Are you sure you want to submit your report?')
                    const choice = await discordService.prompt(message.channel, message.author, prompt, [
                        '✅', '🚫']) === '✅'

                    if (choice) {
                        return ticketController.submit()
                    }

                } else {
                    return message.reply('You\'re not currently filing a report.')
                }

            } else {
                return message.reply('You have no open tickets.')
            }

        } else {
            return message.reply('This command can only be used in private messages.')
        }
    }
}
