'use strict'
const discordService = require('../services/discord')
const { MessageEmbed } = require('discord.js')
const TicketController = require('./ticket')

const applicationConfig = require('../../config/application')

const TICKETS_INTERVAL = 60000

module.exports = class TicketsController {
    constructor (client, guild) {
        this.client = client
        this.guild = guild

        this.debounces = []
        this.tickets = []

        this.init()
    }

    async init () {
        this.client.on('message', this.message.bind(this))
    }

    async message (message) {
        if (message.author.bot) {
            return
        }
        if (message.partial) {
            await message.fetch()
        }

        // If message is a DM
        if (!message.guild) {
            // If author can create a ticket
            if (!this.debounces[message.author.id]) {
                this.debounces[message.author.id] = true
                const timeout = setTimeout(this.clear.bind(this, message.author.id), TICKETS_INTERVAL)

                const embed = new MessageEmbed()
                    .setColor(applicationConfig.primaryColor)
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                    .setDescription('Welcome to NS Roblox Support, do you want to create a ticket?')
                const prompt = await message.channel.send(embed)
                const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅',
                    '🚫']) === '✅'

                if (choice) {
                    clearTimeout(timeout)
                    const ticketController = new TicketController(this, this.client, message)
                    this.tickets[message.author.id] = ticketController
                    ticketController.once('close', this.clear.bind(this, message.author.id))
                }

            // If author already has created a ticket
            } else if (this.tickets[message.author.id]) {

            }

        // If message is sent in a channel in the Tickets category in the guild
        } else if (message.channel.parentID === this.guild.getData('channels').ticketsCategory) {

        }
    }

    clear (authorId) {
        delete this.debounces[authorId]
        delete this.tickets[authorId]
    }
}
