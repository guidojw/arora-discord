'use strict'
const applicationAdapter = require('../adapters/application')
const userService = require('../services/user')
const { MessageEmbed } = require('discord.js')
const groupService = require('../services/group')
const timeHelper = require('../helpers/time')
const pluralize = require('pluralize')

const applicationConfig = require('../../config/application')

module.exports = async guild  => {
    const channels = guild.getData('channels')
    const messages = guild.getData('messages')
    const channel = guild.guild.channels.cache.get(channels.trainingsChannel)

    const message = await channel.messages.fetch(messages.trainingsMessage)
    const trainings = (await applicationAdapter('get', `/v1/groups/${applicationConfig
        .groupId}/trainings?sort=date`)).data
    const authorIds = [...new Set(trainings.map(training => training.authorId))]
    const authors = await userService.getUsers(authorIds)
    const trainingsEmbed = getTrainingsEmbed(trainings, authors)
    message.edit(trainingsEmbed)

    const now = new Date()
    const nextTraining = trainings.find(training => new Date(training.date) > now)
    const infoMessage = await channel.messages.fetch(messages.trainingInfoMessage)
    infoMessage.embeds[0].fields[1].value = nextTraining ? getNextTrainingMessage(nextTraining, authors) : ':x: There' +
        ' are currently no scheduled trainings.'
    infoMessage.edit(infoMessage.embeds)
}

function getTrainingsEmbed (trainings, authors) {
    const groupedTrainings = groupService.groupTrainingsByType(trainings)
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
                result += getTrainingMessage(training, authors)
                if (j < typeTrainings.length) result += '\n'
            }
        } else {
            result += ':x: No scheduled trainings'
        }
        embed.addField(type, result)
    }
    return embed
}

function getTrainingMessage (training, authors) {
    const now = new Date()
    const today = now.getDate()
    const date = new Date(training.date)
    const timeString = timeHelper.getTime(date)
    const trainingDay = date.getDate()
    const dateString = trainingDay === today ? 'Today' : trainingDay === today + 1 ? 'Tomorrow' : timeHelper
        .getDate(date)
    const author = authors.find(author => author.id === training.authorId)
    let result = `:calendar_spiral: **${dateString}** at **${timeString}** hosted by ${author.name}`
    const hourDifference = date.getHours() - now.getHours()
    if (trainingDay === today && hourDifference <= 5) {
        if (hourDifference === 0) {
            const minuteDifference = date.getMinutes() - now.getMinutes()
            if (minuteDifference >= 0) {
                result += `\n> :alarm_clock: Starts in: **${minuteDifference} ${pluralize('minute',
                    minuteDifference)}**`
            } else {
                result += `\n> :alarm_clock: Started **${-1 * minuteDifference} ${pluralize('minute',
                    minuteDifference)}** ago`
            }
        } else {
            result += `\n> :alarm_clock: Starts in: **${hourDifference} ${pluralize('hour', hourDifference)}**`
        }
    }
    if (training.notes) result += `\n> :notepad_spiral: ${training.notes}`
    return result
}

function getNextTrainingMessage (training, authors) {
    const now = new Date()
    const today = now.getDate()
    const date = new Date(training.date)
    const timeString = timeHelper.getTime(date)
    const trainingDay = date.getDate()
    const dateString = trainingDay === today ? 'today' : trainingDay === today + 1 ? 'tomorrow' : timeHelper
        .getDate(date)
    const author = authors.find(author => author.id === training.authorId)
    let result = `${training.type.toUpperCase()} **${dateString}** at **${timeString}** hosted by ${author.name}`
    if (training.notes) result += `\n${training.notes}`
    return result
}
