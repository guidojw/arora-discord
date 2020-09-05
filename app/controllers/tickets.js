'use strict'
const discordService = require('../services/discord')
const { MessageEmbed } = require('discord.js')
const { TicketController, TicketState } = require('./ticket')
const { stripIndents } = require('common-tags')

const applicationConfig = require('../../config/application')

const TICKETS_INTERVAL = 60000

module.exports = class TicketsController {
    constructor (client) {
        this.client = client

        this.tickets = {} // map from ticket ID to TicketController
        this.debounces = {} // map from user ID to debounce flag

        this.init()
    }

    async init () {
        // Instantiate a TicketController for every ticket's channel
        const guild = this.client.bot.mainGuild
        const channels = guild.getData('channels')
        const category = guild.guild.channels.cache.get(channels.ticketsCategory)

        for (const channel of category.children.values()) {
            // Ignore the ratings channel
            if (channel.id === channels.ratingsChannel) {
                continue
            }

            // Substring the id from the channel name (bug-id)
            const id = channel.name.split('-')[1]

            // Instantiate a new TicketController
            const ticketController = new TicketController(this, this.client)
            ticketController.id = id
            ticketController.channel = channel
            this.tickets[id] = ticketController
            ticketController.once('close', this.clearTicket.bind(this, ticketController))

            const embed = new MessageEmbed()
                .setColor(0xff0000)
                .setTitle('This ticket is now in closing state')
                .setDescription(stripIndents`
                    NSadmin has rebooted and has lost this ticket\'s data. 
                    You cannot communicate with the ticket\'s creator anymore. 
                    Please close this ticket using the \`/closeticket\` command.
                    `)
            await channel.send(embed)
        }

        // Connect the message event for making new tickets
        this.client.on('message', this.message.bind(this))
    }

    async message (message) {
        if (message.author.bot) {
            return
        }
        if (message.partial) {
            await message.fetch()
        }
        if (message.content.startsWith(this.client.commandPrefix)) {
            return
        }

        // If message is a DM
        if (!message.guild) {
            let ticketController = this.getTicketFromAuthor(message.author)

            // If author doesn't have a open ticket yet and can create a ticket
            if (!ticketController && !this.debounces[message.author.id]) {
                // Get the user's member in the bot's main guild
                const member = this.client.bot.mainGuild.guild.members.cache.find(member => {
                    return member.user.id === message.author.id
                })

                // Only allow the user to make a new ticket
                // if they're in they're in the guild
                if (member) {

                    // If the support system is offline, let the user know
                    if (!this.client.bot.mainGuild.getData('settings').supportEnabled) {
                        const embed = new MessageEmbed()
                            .setColor(0xff0000)
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                            .setTitle('Welcome to NS Roblox Support')
                            .setDescription('We are currently closed. Check the NS Roblox server for more information.')
                        return message.channel.send(embed)
                    }

                    // Set a timeout of 60 seconds after which the bot
                    // will automatically cancel the ticket
                    this.debounces[message.author.id] = true
                    const timeout = setTimeout(this.clearAuthor.bind(this, message.author), TICKETS_INTERVAL)

                    // Prompt if the user actually wants to make a ticket
                    const embed = new MessageEmbed()
                        .setColor(applicationConfig.primaryColor)
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                        .setTitle('Welcome to NS Roblox Support')
                        .setDescription('Do you want to create a ticket?')
                    const prompt = await message.channel.send(embed)
                    const choice = await discordService.prompt(message.channel, message.author, prompt, [
                        '✅', '🚫']) === '✅'

                    // If the user wants to create a ticket
                    if (choice) {
                        // If the user is indeed in the guild,
                        // Check if the user is banned from making tickets
                        const roles = this.client.bot.mainGuild.getData('roles')
                        if (member.roles.cache.has(roles.ticketsBannedRole)) {
                            const banEmbed = new MessageEmbed()
                                .setColor(0xff0000)
                                .setTitle('Couldn\'t make ticket')
                                .setDescription('You\'re banned from making new tickets.')
                            return message.author.send(banEmbed)
                        }

                        clearTimeout(timeout)

                        // Instantiate and connect a new TicketController
                        ticketController = new TicketController(this, this.client, message)
                        this.tickets[ticketController.id] = ticketController
                        ticketController.once('close', this.clearTicket.bind(this, ticketController))

                    // If the user doesn't want to create a ticket
                    } else {
                        // Let the user know they can create a new ticket in 60 seconds
                        const closeEmbed = new MessageEmbed()
                            .setColor(applicationConfig.primaryColor)
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                            .setTitle('Prompt closed')
                            .setDescription('A new prompt will be opened again if you DM me after 60 seconds.')
                        await message.author.send(closeEmbed)
                    }
                }

            // If author already has created a ticket
            } else if (ticketController) {
                // If the ticket's author is currently entering their report,
                // add the message to the ticket's report messages
                if (ticketController.state === TicketState.SUBMITTING_REPORT) {
                    ticketController.report.push(message)

                // If the ticket has been created and a new message is sent
                } else if (ticketController.state === TicketState.CONNECTED) {
                    await ticketController.send(message, ticketController.channel)
                }
            }

        // If message is sent in a channel in the Tickets category in the guild
        } else if (message.channel.parentID === this.client.bot.mainGuild.getData('channels').ticketsCategory) {
            const ticketController = this.getTicketFromChannel(message.channel)

            // If channel is from a ticket
            if (ticketController) {
                // If this ticket is reconnected and thus has lost its author,
                // don't try to send
                if (ticketController.state === TicketState.RECONNECTED) {
                    return
                }

                // Send the message to the other side (author/channel)
                await ticketController.send(message, ticketController.author)

                // If the author is not yet added to the ticket's moderators,
                // add the author to the ticket's moderators
                if (!ticketController.moderators.includes(message.author)) {
                    ticketController.moderators.push(message.author)
                }
            }
        }
    }

    clearTicket (ticketController) {
        if (ticketController) {
            // If the TicketController hasn't lost its author
            if (ticketController.state !== TicketState.RECONNECTED) {
                this.clearAuthor(ticketController.author)
            }

            delete this.tickets[ticketController.id]
        }
    }

    clearAuthor (author) {
        delete this.debounces[author.id]
    }

    getTicketFromChannel (channel) {
        return Object.values(this.tickets).find(ticketController => {
            return ticketController.channel.id === channel.id
        })
    }

    getTicketFromAuthor (author) {
        return Object.values(this.tickets).find(ticketController => {
            return ticketController.state !== TicketState.RECONNECTED && ticketController.author.id === author.id
        })
    }

    inhibitor (message) {
        if (message.guild) {
            return
        }
        if (!message.command) {
            return
        }

        const ticketController = this.getTicketFromAuthor(message.author)
        if (ticketController === undefined && !this.debounces[message.author.id]) {
            return 'ticket prompt'
        }
    }
}
