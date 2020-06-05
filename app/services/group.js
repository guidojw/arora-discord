'use strict'
const timeHelper = require('../helpers/time')
const userService = require('../services/user')
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')
const lodash = require('lodash')

const applicationConfig = require('../../config/application')

const trainingTypes = { 'Conductor': [], 'Customer Service Representative': [] }

exports.getTrainingSentence = async training => {
    const role = training.type.toUpperCase()
    const date = new Date(training.date)
    const readableDate = timeHelper.getDate(date)
    const readableTime = timeHelper.getTime(date)
    return `**${role}** training on **${readableDate}** at **${readableTime} ${timeHelper.isDst(
        date) && 'CEST' || 'CET'}**, hosted by **${(await userService.getUser(training.authorId)).name}**.`
}

exports.getRoleByAbbreviation = str => {
    if (str) {
        str = str.toUpperCase()
        return str === 'G' && 'Guest' || str === 'C' && 'Customer' || str === 'S' && 'Suspended' || str === 'TD' &&
            'Train Driver' || str === 'CD' && 'Conductor' || str === 'CSR' && 'Customer Service Representative' || str
            === 'CS' && 'Customer Service' || str === 'LC' && 'Line Controller' || str === 'PR' &&
            'Partner Representative' || str === 'R' && 'Representative' || str === 'MC' && 'Management Coordinator' ||
            str === 'OC' && 'Operations Coordinator' || str === 'GA' && 'Group Admin' || str === 'M' && 'Management' ||
            str === 'BoD' && 'Board of Directors' || str === 'CF' && 'Co-Founder' || str === 'AA' && 'Alt. Accounts' ||
            str === 'PD' && 'President-Director' || str === 'UT' && 'Update Tester' || str === 'P' && 'Pending' || str
            === 'PH' && 'Pending HR' || str === 'HoCR' && 'Head of Customer Relations' || str === 'HoRS' &&
            'Head of Rolling Stock' || str === 'HoS' && 'Head of Stations' || str === 'HoE' && 'Head of Events' || str
            === 'HoC' && 'Head of Conductors' || str === 'OD' && 'Operations Director' || str === 'SD' &&
            'Staff Director' || undefined
    }
}

exports.getAbbreviationByRank = (rank, group) => {
    if (rank === 0) return 'G'
    if (!group || group === applicationConfig.groupId) {
        return rank === 1 && 'C' || rank === 2 && 'S' || rank === 3 && 'TD' || rank === 4 && 'CD' || rank === 5 && 'CSR'
            || rank === 99 && 'PR' || rank === 100 && 'R' || rank === 101 && 'SC' || rank === 102 && 'OC' || rank ===
            103 && 'GA' || rank === 251 && 'M' || rank === 252 && 'BoD' || rank === 253 && 'CF' || rank === 254 && 'AA'
            || rank === 255 && 'PD' || null
    } else if (group === applicationConfig.mtGroupId) {
        return rank === 2 && 'P' || rank === 50 && 'UT' || rank === 55 && 'LC' || rank === 100 && 'R' || rank === 101 &&
            'SC' || rank === 102 && 'OC' || rank === 199 && 'PHR' || rank === 244 && 'HoCR' || rank === 247 && 'HoS' ||
            rank === 246 && 'HoE' || rank === 249 && 'HoC' || rank === 250 && 'HoRM' || rank === 251 && 'SD' || rank ===
            252 && 'OD' || rank === 253 && 'GA' || rank === 254 && 'AA' || rank === 255 && 'PD'
    }
}

exports.getTrainingEmbeds = async trainings => {
    const embeds = []
    let fields = []
    let sum = 0
    const addField = message => {
        message = message.trim()
        fields.push({ name: '\u200b', value: message })
    }
    const addEmbed = () => {
        const embed = new MessageEmbed()
            .addFields(fields)
            .setColor(applicationConfig.primaryColor)
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    for (const training of trainings) {
        const line = training.id + '. ' + await exports.getTrainingSentence(training)
        const addition = line.length + 8 // TODO: tweak additions
        if (sum + addition <= 6000) {
            if (message.length + line.length <= 1024) {
                sum += line.length
            } else {
                addField(message)
                message = ''
                sum += addition
            }
        } else {
            addField(message)
            message = ''
            addEmbed()
        }
        message += (line + '\n')
    }
    const addition = message.length + 8
    if (sum + addition > 6000) {
        addEmbed()
    }
    addField(message)
    addEmbed()
    embeds[0].setTitle('Upcoming Trainings')
    return embeds
}

exports.getSuspensionEmbeds = async suspensions => {
    const userIds = suspensions.map(suspension => suspension.userId)
    const authorIds = suspensions.map(suspension => suspension.authorId)
    const users = await userService.getUsers(userIds)
    const authors = await userService.getUsers(authorIds)
    const embeds = []
    let fields = []
    let sum = 0
    const addField = message => {
        message = message.trim()
        fields.push({ name: '\u200b', value: message })
    }
    const addEmbed = () => {
        const embed = new MessageEmbed()
            .addFields(fields)
            .setColor(applicationConfig.primaryColor)
        embeds.push(embed)
        fields = []
        sum = 0
    }
    let message = ''
    for (const suspension of suspensions) {
        const username = users.find(user => user.id === suspension.userId).name
        const author = authors.find(user => user.id === suspension.authorId)
        const role = exports.getAbbreviationByRank(suspension.rank)
        const rankBack = suspension.rankBack ? 'yes' : 'no'
        const dateString = timeHelper.getDate(new Date(suspension.date))
        const days = suspension.duration / 86400000
        let extensionDays = 0
        if (suspension.extensions) {
            for (const extension of suspension.extensions) {
                extensionDays += extension.duration / 86400000
            }
        }
        const extensionString = extensionDays < 0 ? ` (${extensionDays})` : extensionDays > 0 ? ` (+${
            extensionDays})` : ''
        const line = `**${username}** (${role}, rankback **${rankBack}**) by **${author.name}** at **${dateString}** ` +
            `for **${days}${extensionString} ${pluralize('day', days + extensionDays)}** with reason:\n*${suspension
                .reason}*`
        const addition = line.length + 16 // TODO: tweak additions
        if (sum + addition <= 6000) {
            if (message.length + line.length <= 1024) {
                sum += line.length
            } else {
                addField(message)
                message = ''
                sum += addition
            }
        } else {
            addField(message)
            message = ''
            addEmbed()
        }
        message += line + '\n'
    }
    const addition = message.length + 8
    if (sum + addition > 6000) {
        addEmbed()
    }
    addField(message)
    addEmbed()
    embeds[0].setTitle('Current Suspensions')
    return embeds
}

exports.groupTrainingsByType = trainings => {
    const result = {}
    for (const training of trainings) {
        const type = exports.getRoleByAbbreviation(training.type)
        if (!result[type]) result[type] = []
        result[type].push(training)
    }
    return lodash.assign({}, trainingTypes, result)
}
