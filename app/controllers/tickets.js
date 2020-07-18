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

        if (!message.guild && !this.tickets[message.author.id]) {
            this.tickets[message.author.id] = true
            const timeout = setTimeout(this.clear.bind(this, message.author.id), TICKETS_INTERVAL)

            const embed = new MessageEmbed()
                .setColor(applicationConfig.primaryColor)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setDescription('Welcome to NS Roblox Support, do you want to create a ticket?')
            const prompt = await message.channel.send(embed)
            const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫'])
                === '✅'

            if (choice) {
                clearTimeout(timeout)
                const ticketController = new TicketController(this.client, message)
                ticketController.on('finished', this.clear.bind(this, message.author.id))
            }
        }
    }

    clear (authorId) {
        delete this.tickets[authorId]
    }
}
