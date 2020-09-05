'use strict'
const EventEmitter = require('events')
const { MessageEmbed } = require('discord.js')
const discordService = require('../services/discord')
const { stripIndents } = require('common-tags')
const short = require('short-uuid')
const roVerAdapter = require('../adapters/roVer')
const timeHelper = require('../helpers/time')
const pluralize = require('pluralize')

const applicationConfig = require('../../config/application')

const TicketState = {
    INIT: 'init',
    REQUESTING_TYPE: 'requestingType',
    REQUESTING_REPORT: 'requestingReport',
    SUBMITTING_REPORT: 'submittingReport',
    CREATING_CHANNEL: 'creatingChannel',
    CONNECTED: 'connected',
    RECONNECTED: 'reconnected',
    REQUESTING_RATING: 'requestingRating',
    CLOSING: 'closing'
}

const TicketType = {
    CONFLICT: 'conflict',
    BUG: 'bug'
}

class TicketController extends EventEmitter {
    constructor (ticketsController, client, message) {
        super()

        this.ticketsController = ticketsController
        this.client = client

        // If this is a new ticket
        if (message) {
            this.message = message
            this.author = message.author

            this.id = short.generate()
            this.state = TicketState.INIT

            this.report = [] // array of messages describing report
            this.moderators = []

            this.init()

        // If this is a reconnected ticket
        // being reinstantiated after reboot
        } else {
            this.state = TicketState.RECONNECTED
        }
    }

    async init () {
        // Ask user what type of support they require
        // If they don't respond, close ticket
        this.type = await this.requestType()
        if (!this.type) {
            return this.close('Ticket closed, you did not respond in time.', false)
        }

        // If the ticket type is a confict/bug report,
        // ask the user for the actual report to be discussed
        if (this.type === TicketType.CONFLICT || this.type === TicketType.BUG) {
            await this.requestReport()
        }
    }

    async requestType () {
        this.state = TicketState.REQUESTING_TYPE

        // Prompt the user what type of ticket they want to make
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('What type of support do you need?')
            .setDescription(stripIndents(
                `1⃣ - I want to report a conflict
                2⃣ - I want to report a bug`))
            .setFooter('Please do only make tickets for conflict or bug reports. Abuse will not be tolerated.')
        const prompt = await this.message.channel.send(embed)
        const choice = await discordService.prompt(this.message.channel, this.message.author, prompt, ['1⃣',
            '2⃣'])

        /* eslint-disable indent */
        return choice === '1⃣' ? TicketType.CONFLICT
            : choice === '2⃣' ? TicketType.BUG
            : undefined
        /* eslint-enable indent */
    }

    async requestReport () {
        this.state = TicketState.REQUESTING_REPORT

        // Prompt the user if their earlier given report
        // sufficiently explains their problem
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
            this.report.push(this.message)
            await this.submit()

        // If the message doesn't explain the report clearly,
        // ask for a summary of the report
        } else if (choice === '🚫') {
            const summariseEmbed = new MessageEmbed()
                .setColor(applicationConfig.primaryColor)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setTitle('Please summarise your report')
                .setDescription(stripIndents`You may use several messages and attach pictures/videos.
                    Use the command \`/submitreport\` once you're done or \`/closeticket\` to close your ticket.`)
            await this.message.channel.send(summariseEmbed)

            this.state = TicketState.SUBMITTING_REPORT

        // If they don't respond, close ticket
        } else {
            await this.close('Ticket closed, you did not respond in time.', false)
        }
    }

    async submit () {
        // If the ticket author is currently entering a report
        if (this.state === TicketState.REQUESTING_REPORT || this.state === TicketState.SUBMITTING_REPORT) {

            // Create channel in guild which admins can see and reply to
            await this.createChannel()

            // Populate the channel with the ticket creator's data
            // and the full report and attachments
            await this.populateChannel()

            // Log the action
            await this.client.bot.log(this.author, `${this.author} **opened ticket** \`${this.id}\` **in** ${
                this.channel}`, `Ticket ID: ${this.id}`)

            // Send success embed in which the following process is clarified
            const embed = new MessageEmbed()
                .setColor(applicationConfig.primaryColor)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setTitle('Successfully submitted ticket')
                .setDescription(stripIndents`Please wait for a Ticket Moderator to assess your ticket.
                    This may take up to 24 hours. You can still close your ticket by using the \`/closeticket\`` +
                    ' command.')
            return this.author.send(embed)
        }
    }

    async send (message, channel) {
        // Send message content if existent
        if (message.content) {
            const embed = new MessageEmbed()
                .setAuthor(message.author.tag, message.author.displayAvatarURL())
                .setDescription(message.content)
                .setFooter(`Ticket ID: ${this.id}`)
            await channel.send(embed)
        }

        // Send attachments if existent
        if (message.attachments) {
            for (const attachment of message.attachments) {
                await channel.send(attachment)
            }
        }
    }

    async createChannel () {
        this.state = TicketState.CREATING_CHANNEL

        const name = `${this.type}-${this.id}`

        // Create channel
        const guild = this.client.bot.mainGuild
        this.channel = await guild.guild.channels.create(name)
        this.channel = await this.channel.setParent(guild.getData('channels').ticketsCategory)

        // Sync channel permissions with category permissions
        await this.channel.lockPermissions()
    }

    async populateChannel () {
        // Check if user is verified with RoVer
        // If so, the Roblox username and ID are retrieved
        const response = (await roVerAdapter('get', `/user/${this.message.author.id}`)).data
        const username = response.robloxUsername
        const userId = response.robloxId

        const date = new Date()
        const readableDate = timeHelper.getDate(date)
        const readableTime = timeHelper.getTime(date)

        // Post an embed in the ticket's channel with the ticket's information
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Ticket Information')
            .setDescription(stripIndents(
                `Username: ${username ? '**' + username + '**' : '*user is not verified with RoVer*'}
                 User ID: ${userId ? '**' + userId + '**' : '*user is not verified with RoVer*'}
                 Start time: ${readableDate + ' ' + readableTime}`))
            .setFooter(`Ticket ID: ${this.id}`)
        await this.channel.send(embed)

        // Indicate this is the start of the report
        const startEmbed = new MessageEmbed()
            .setTitle('Start report')
        await this.channel.send(startEmbed)

        // Send all report messages to the just created channel
        for (const message of this.report) {
            await this.send(message, this.channel)
        }

        // Indicate this is the end of the report
        const endEmbed = new MessageEmbed()
            .setTitle('End report')
        await this.channel.send(endEmbed)

        // Change state to connected so that the TicketsController knows
        // to link messages through to the newly created channel
        this.state = TicketState.CONNECTED
    }

    async close (message, success, color) {
        // Delete the ticket's channel in the guild if existent
        if (this.channel) {
            await this.channel.delete()
        }

        // If this ticket isn't reconnected and thus hasn't lost its author
        if (this.state !== TicketState.RECONNECTED) {
            this.state = TicketState.CLOSING

            // Send closing message
            const embed = new MessageEmbed()
                .setColor(color ? color : success ? 0x00ff00 : 0xff0000)
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                .setTitle(message)
            await this.message.channel.send(embed)

            // Request for the ticket creator's rating if
            // the ticket was closed successfully
            if (success) {
                const rating = await this.requestRating()

                // If a rating was submitted, log it
                if (rating) {
                    await this.logRating(rating)

                // If no rating is submitted after the reaction collector closes
                } else {
                    // Tell the user their rating hasn't been submitted
                    const successEmbed = new MessageEmbed()
                        .setColor(applicationConfig.primaryColor)
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
                        .setTitle('No rating submitted')
                    await this.author.send(successEmbed)
                }
            }
        }

        this.emit('close')
    }

    async requestRating () {
        this.state = TicketState.REQUESTING_RATING

        // Send the question embed
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('How would you rate the support you got?')
        const message = await this.author.send(embed)

        // Prompt how the user rates their support
        const options = []
        for (let i = 5; i >= 1; i--) {
            options.push(discordService.getEmojiFromNumber(i))
        }

        let rating = await discordService.prompt(this.author, this.author, message, options)
        rating = rating && rating.substring(0, 1)
        return rating
    }

    async logRating (rating) {
        // Form a string of the moderator's names
        let result = ''
        for (let i = 0; i < this.moderators.length; i++) {
            const moderator = this.moderators[i]
            result += `**${moderator.tag}**`
            if (i < this.moderators.length - 2) {
                result += ', '
            } else if (i === this.moderators.length - 2) {
                result += ' & '
            }
        }
        result = result || 'none'

        // Get the ratings channel
        const channels = this.client.bot.mainGuild.getData('channels')
        const channel = this.client.bot.mainGuild.guild.channels.cache.get(channels.ratingsChannel)

        // Send the ticket rating
        const ratingEmbed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.author.tag, this.author.displayAvatarURL())
            .setTitle('Ticket Rating')
            .setDescription(stripIndents(
                `${pluralize('Moderator', this.moderators.length)}: ${result}
                        Rating: **${rating}**`))
            .setFooter(`Ticket ID: ${this.id}`)
        await channel.send(ratingEmbed)

        // Tell the user their rating has been submitted
        const successEmbed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Rating submitted')
            .setDescription('Thank you!')
        return this.author.send(successEmbed)
    }
}

module.exports = {
    TicketController,
    TicketState,
    TicketType
}
