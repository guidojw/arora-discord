'use strict'
const applicationAdapter = require('../adapters/application')
const userService = require('../services/user')
const { MessageEmbed } = require('discord.js')
const groupService = require('../services/group')
const timeHelper = require('../helpers/time')
const lodash = require('lodash')

const applicationConfig = require('../../config/application')

const trainingTypes = {'Conductor': [], 'Customer Service Representative': []}

module.exports = async guild  => {
    const channels = guild.getData('channels')
    const messages = guild.getData('messages')
    const channel = guild.guild.channels.cache.get(channels.trainingsChannel)
    const message = await channel.messages.fetch(messages.trainingsMessage)
    const trainings = (await applicationAdapter('get', `/v1/groups/${applicationConfig
        .groupId}/trainings`)).data
    trainings.sort((a, b) => a.date - b.date)
    const authorIds = [...new Set(trainings.map(training => training.authorId))]
    const authors = await userService.getUsers(authorIds)
    const trainingsEmbed = getTrainingsEmbed(trainings, authors)
    message.edit(trainingsEmbed)
}

function getTrainingsEmbed (trainings, authors) {
    const now = new Date()
    const today = now.getDate()
    const groupedTrainings = groupTrainingsByType(trainings)
    const types = Object.keys(groupedTrainings)
    const embed = new MessageEmbed()
        .setColor(applicationConfig.primaryColor)
        .setFooter('Updated at')
        .setTimestamp()
    for (let i = 0; i < types.length; i++) {
        const type = types[i]
        const typeTrainings = groupedTrainings[type]
        let result = ''
        if (typeTrainings.length > 0) {
            for (let j = 0; j < typeTrainings.length; j++) {
                const training = typeTrainings[j]
                const date = new Date(training.date)
                const timeString = timeHelper.getTime(date)
                const trainingDay = date.getDate()
                const dateString = trainingDay === today ? 'Today' : trainingDay === today + 1 ? 'Tomorrow' : timeHelper
                    .getDate(date)
                const author = authors.find(author => author.id === training.authorId)
                result += `**${dateString}** at **${timeString}** hosted by ${author.name}`
                const hourDifference = date.getHours() - now.getHours()
                if (trainingDay === today && hourDifference <= 5) {
                    result += `\n> :alarm_clock: Starts in: **${hourDifference} hours**`
                }
                if (training.notes) result += `\n> ${training.notes}`
                if (j < typeTrainings.length) result += '\n'
            }
        } else {
            result += ':x: No scheduled trainings'
        }
        embed.addField(type, result)
    }
    return embed
}

function groupTrainingsByType (trainings) {
    const result = {}
    for (const training of trainings) {
        const type = groupService.getRoleByAbbreviation(training.type)
        if (!result[type]) result[type] = []
        result[type].push(training)
    }
    return lodash.assign({}, trainingTypes, result)
}
