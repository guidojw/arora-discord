'use strict'
const EventEmitter = require('events')
const { MessageEmbed } = require('discord.js')
const discordService = require('../services/discord')
const { stripIndents } = require('common-tags')
const short = require('short-uuid')
const roVerAdapter = require('../adapters/roVer')
const timeHelper = require('../helpers/time')

const applicationConfig = require('../../config/application')

const TicketStates = {
    INIT: 'init',
    REQUESTING_TYPE: 'requestingType',
    REQUESTING_REPORT: 'requestingReport',
    CREATING_CHANNEL: 'creatingChannel',
    CONNECTED: 'connected',
    CLOSING: 'closing'
}

const TicketTypes = {
    CONFLICT: 'conflict',
    BUG: 'bug'
}

class TicketController extends EventEmitter {
    constructor (ticketsController, client, message) {
        super()

        this.ticketsController = ticketsController
        this.client = client
        this.message = message
        this.author = message.author

        this.id = short.generate()
        this.state = TicketStates.INIT

        this.report = [] // array of messages describing report

        this.init()
    }

    async init () {
        // Ask user what type of support they require
        // If they don't respond, close ticket
        this.type = await this.requestType()
        if (!this.type) {
            return this.close()
        }

        // If the ticket type is a confict/bug report,
        // ask the user for the actual report to be discussed
        if (this.type === TicketTypes.CONFLICT || this.type === TicketTypes.BUG) {
            await this.requestReport()
        }
    }

    async requestType () {
        this.state = TicketStates.REQUESTING_TYPE

        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('What type of support do you need?')
            .setDescription(stripIndents(
                `1⃣ - I want to report a conflict
                2⃣ - I want to report a bug`))
        const prompt = await this.message.channel.send(embed)
        const choice = await discordService.prompt(this.message.channel, this.message.author, prompt, ['1⃣', '2⃣'])

        /* eslint-disable indent */
        return choice === '1⃣' ? TicketTypes.CONFLICT
            : choice === '2⃣' ? TicketTypes.BUG
            : undefined
        /* eslint-enable indent */
    }

    async requestReport () {
        this.state = TicketStates.REQUESTING_REPORT

        const content = this.message.content
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Does the following clearly explain your report?')
            .setDescription(content)
        const prompt = await this.message.channel.send(embed)
        const choice = await discordService.prompt(this.message.channel, this.message.author, prompt, ['✅',
            '🚫'])

        // If the message explains the report clearly,
        // add it to the report messages
        if (choice === '✅') {
            this.addMessage(this.message)
            await this.submit()

        // If the message doesn't explain the report clearly,
        // ask for a summary of the report
        } else if (choice === '🚫') {
            const summariseEmbed = new MessageEmbed()
                .setColor(applicationConfig.primaryColor)
                .setAuthor(this.client.user.tag, this.client.user.displayAvatarURL())
                .setTitle('Please summarise your report')
                .setDescription(stripIndents`You may use several messages and attach pictures/videos.
                    Use the command \`/submit\` once you're done or \`/close\` to close your ticket.`)
            await this.message.channel.send(summariseEmbed)

        // If they don't respond, close ticket
        } else {
            return this.close()
        }
    }

    async createChannel () {
        this.state = TicketStates.CREATING_CHANNEL

        const name = `${this.type}-${this.id}`

        // Create channel
        const guild = this.client.bot.masterGuild
        this.channel = await guild.guild.channels.create(name)
        this.channel = await this.channel.setParent(guild.getData('channels').ticketsCategory)

        // Sync channel permissions with category permissions
        await this.channel.lockPermissions()

        // Show the channel to the ticket's creator
        const permissions = this.channel.permissionsFor(this.message.author)
        permissions.add('VIEW_CHANNEL')

        const response = (await roVerAdapter('get', `/user/${this.message.author.id}`)).data
        const username = response.robloxUsername
        const userId = response.robloxId
        const date = new Date()
        const readableDate = timeHelper.getDate(date)
        const readableTime = timeHelper.getTime(date)

        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Ticket Information')
            .setDescription(stripIndents(
                `Username: ${username ? '**' + username + '**' : '*user is not verified with RoVer*'}
                 User ID: ${userId ? '**' + userId + '**' : '*user is not verified with RoVer*'}`))
            .setFooter(`Start time: ${readableDate + ' ' + readableTime} - Ticket ID: ${this.id}`)
        await this.channel.send(embed)

        // Change state to connected so that the TicketsController knows
        // to link messages through to the newly created channel
        this.state = TicketStates.CONNECTED
    }

    addMessage (message) {
        this.report.push(message)
    }

    async submit () {
        if (this.state === TicketStates.REQUESTING_REPORT) {

            // Create channel in guild which admins can see and reply to
            await this.createChannel()

            // Send all report messages to the just created channel
            for (const message of this.report) {
                const embed = new MessageEmbed()
                    .setAuthor(this.message.author.tag, this.message.author.displayAvatarURL())
                    .setDescription(message)
                await this.channel.send(embed)
            }
        }
    }

    async close () {
        this.state = TicketStates.CLOSING

        const embed = new MessageEmbed()
            .setColor(0xff0000)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setDescription('Ticket closed, you did not respond in time.')
        await this.message.channel.send(embed)

        this.emit('close')
    }
}

module.exports = {
    TicketController,
    TicketStates,
    TicketTypes
}
