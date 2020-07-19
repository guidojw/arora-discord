'use strict'
const EventEmitter = require('events')
const { MessageEmbed } = require('discord.js')
const discordService = require('../services/discord')
const { stripIndents } = require('common-tags')
const short = require('short-uuid')
const roVerAdapter = require('../adapters/roVer')
const timeHelper = require('../helpers/time')

const applicationConfig = require('../../config/application')

module.exports = class TicketController extends EventEmitter {
    constructor (ticketsController, client, message) {
        super()

        this.ticketsController = ticketsController
        this.client = client
        this.message = message

        this.init()
    }

    async init () {
        // Ask user what type of support they require
        // If they don't respond, close ticket
        const type = await this.requestSupportType()
        if (!type) {
            return this.close()
        }

        // Ask the user for the report to be discussed
        await this.requestClarity()


        // Create channel in guild which admins can see and reply to
        const id = short.generate()
        const name = `${type}-${id}`

        const guild = this.ticketsController.guild
        const channel = await guild.guild.channels.create(name)
        await channel.setParent(guild.getData('channels').ticketsCategory)

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
            .setFooter(`Start time: ${readableDate + ' ' + readableTime} - Ticket ID: ${id}`)
        await channel.send(embed)


    }

    async requestSupportType () {
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
        return choice === '1⃣' ? 'conflict'
            : choice === '2⃣' ? 'bug'
            : undefined
        /* eslint-enable indent */
    }

    async requestClarity () {
        const content = this.message.content
        const embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('Does the following clearly explain your report?')
            .setDescription(content)
        const prompt = await this.message.channel.send(embed)
        const choice = await discordService.prompt(this.message.channel, this.message.author, prompt,
            ['✅', '🚫'])

        if (choice === '✅') {

        } else if (choice === '🚫') {

        } else {

        }
    }

    async close () {
        const embed = new MessageEmbed()
            .setColor(0xff0000)
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setDescription('Ticket closed, you did not respond in time.')
        await this.message.channel.send(embed)

        this.emit('close')
    }
}
