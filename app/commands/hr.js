'use strict'
require('dotenv').config()

const base = require('path').resolve('.')

const discordHelper = require('../helpers/discord')
const randomHelper = require('../helpers/random')
const stringHelper = require('../helpers/string')
const groupHelper = require('../helpers/group')
const userHelper = require('../helpers/user')
const timeHelper = require('../helpers/time')

const applicationAdapter = require('../adapters/application')

const botController = require('../controllers/bot')

const InputError = require('../errors/input-error')
const PermissionError = require('../errors/permission-error')

const activities = require('../content/activities')

const config = require(base + '/config/application')

exports.suspend = async req => {
    let days = parseInt(req.args[1])
    if (days) {
        days = Math.round(days)
        if (days < 1) {
            throw new InputError('Insufficient amount of days.')
        } else if (days > 7) {
            throw new InputError('Too many days.')
        }
    } else throw new InputError('Days must be a number.')
    const rankback = req.args[2] && req.args[2].toLowerCase() === 'no' ? 0 : 1
    const reason = stringHelper.extractText(req.message.content, '"')
    if (!reason) throw new InputError('Please enter a reason between *double* quotation marks.')
    const username = req.args[0]
    const userId = await userHelper.getIdFromUsername(username)
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    await applicationAdapter('post', `/v1/groups/${config.groupId}/suspensions`, {
        userId: userId,
        rankback: rankback,
        duration: days * 86400,
        by: byUserId,
        reason: reason
    })
    req.channel.send(discordHelper.getEmbed(req.command, `Successfully suspended **${username}**.`))
}

exports.promote = async req => {
    const username = req.args[0]
    const userId = await userHelper.getIdFromUsername(username)
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    await applicationAdapter('post', `/v1/groups/${config.groupId}/promote/${userId}`, {
        by: byUserId
    })
    req.channel.send(discordHelper.getEmbed(req.command, `Successfully promoted **${username}**.`))
}

exports.pban = async req => {
    const reason = stringHelper.extractText(req.message.content, '"')
    if (!reason) throw new InputError('Please enter a reason between *double* quotation marks.')
    const username = req.args[0]
    const userId = await userHelper.getIdFromUsername(username)
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    await applicationAdapter('post', `/v1/bans`, {
        userId: userId,
        by: byUserId,
        reason: reason,
        groupId: config.groupId
    })
    req.channel.send(discordHelper.getEmbed(req.command, `Successfully banned **${username}**.`))
}

exports.shout = async req => {
    const username = req.member.nickname
    let message = ''
    if (req.args[0] !== 'clear') {
        message = stringHelper.extractText(req.message.content, '"')
        if (!message) throw new InputError('Please enter a shout between *double* quotation marks.')
        message += (' ~' + username)
        if (message.length > 255) throw new InputError('Can\'t post shout, it\'s too long.')
    }
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    await applicationAdapter('post', `/v1/groups/${config.groupId}/shout`, {
        by: byUserId,
        message: message
    })
    if (req.args[0] === 'clear') {
        req.channel.send(discordHelper.getEmbed(req.command, 'Successfully cleared shout.'))
    } else {
        req.channel.send(discordHelper.getEmbed(req.command, `Successfully shouted *"${message}"*`))
    }
}

exports.clearreports = async req => {
    const reportsChannel = discordHelper.getChannel(req.guild, 'reports')
    const messages = reportsChannel.fetchMessages()
    if (messages.size - 1 > 0) {
        await reportsChannel.bulkDelete(messages.size - 1)
        if (req.channel !== reportsChannel) {
            req.channel.send(discordHelper.getEmbed(req.command, `Successfully deleted **${messages.size - 1}** ` +
                `messages in ${reportsChannel}.`))
        }
    } else throw new InputError('There are no messages to delete in #reports.')
}

exports.uw = req => {
    req.channel.send(`<${config.updatesWorkplaceLink}> - Updates Workplace`)
}

exports.updatesworkplace = req => {
    exports.uw(req)
}

exports.docs = req => {
    const hrChannel = discordHelper.getChannel(req.guild, 'hr')
    if (req.channel === hrChannel) {
        req.channel.send(`<${process.env.TP_DOC}> - Training Protocols`)
        req.channel.send(`<${process.env.TL_DOC}> - Training Logs`)
        req.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`)
    } else throw new InputError('Wrong channel!')
}

exports.hrdocs = req => {
    exports.docs(req)
}

exports.traininglogs = req => {
    const hrChannel = discordHelper.getChannel(req.guild, 'hr')
    if (req.channel === hrChannel) {
        req.channel.send(`<${process.env.TL_DOC}> - Training Logs`)
    } else throw new InputError('Wrong channel!')
}

exports.tl = req => {
    exports.traininglogs(req)
}

exports.maliciousspreadsheets = req => {
    const hrChannel = discordHelper.getChannel(req.guild, 'hr')
    if (req.channel === hrChannel) {
        req.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`)
    } else throw new InputError('Wrong channel!')
}

exports.ms = req => {
    exports.maliciousspreadsheets(req)
}

exports.trainingprotocols = req => {
    const hrChannel = discordHelper.getChannel(req.guild, 'hr')
    if (req.channel === hrChannel) {
        req.channel.send(`<${process.env.MS_DOC}> - Malicious Spreadsheets`)
    } else throw new InputError('Wrong channel!')
}

exports.tp = req => {
    exports.trainingprotocols(req)
}

exports.isindiscord = req => {
    if (!req.args[0]) throw new InputError('Please enter a username.')
    const member = discordHelper.getMemberByName(req.guild, req.args[0])
    if (member) {
        req.channel.send(discordHelper.compileRichEmbed([{
            title: req.command,
            message: `Yes, **${member.nickname}** is in this server`,
        }]))
    } else {
        req.channel.send(discordHelper.compileRichEmbed([{
            title: req.command,
            message: `No, **${req.args[0]}** is not in this server.`,
        }]))
    }
}

exports.activity = async req => {
    if (req.args[0] && parseInt(req.args[0])) {
        const activity = parseInt(req.args[0]) - 1
        if (activities[activity]) {
            const status = await botController.setActivity(activity)
            req.channel.send(discordHelper.getEmbed('**Successfully set activity to**', status))
        } else throw new InputError('No action with that number exists.')
    } else {
        const status = await botController.setActivity(randomHelper.getRandomInt(activities.length, botController
            .currentActivityNumber))
        req.channel.send(discordHelper.getEmbed('**Successfully set activity to**', status))
    }
}

exports.status = async req => {
    await exports.activity(req)
}

exports.host = async req => {
    const type = req.args[0]
    const role = groupHelper.getRoleByAbbreviation(type)
    if (!role) throw new InputError('Please enter a valid type of training.')
    const dateString = req.args[1]
    if (!dateString) throw new InputError('Please give a date for your training.')
    if (!timeHelper.validDate(dateString)) throw new InputError('Please give a valid date for your training.')
    const timeString = req.args[2]
    if (!timeString) throw new InputError('Please give a time for your training.')
    if (!timeHelper.validTime(timeString)) throw new InputError('Please give a valid time for your training.')
    const specialnotes = stringHelper.extractText(req.message.content, '"')
    const dateInfo = timeHelper.getDateInfo(dateString)
    const timeInfo = timeHelper.getTimeInfo(timeString)
    const dateUnix = timeHelper.getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo
        .hours, timeInfo.minutes))
    const nowUnix = timeHelper.getUnix()
    const afterNow = dateUnix - nowUnix > 0
    if (!afterNow) throw new InputError('Please give a date and time that\'s after now.')
    const username = req.member.nickname ? req.member.nickname : req.author.username
    const trainingId = (await applicationAdapter('post', `/v1/groups/${config.groupId}/trainings`,
        {
        by: username,
        type: type,
        date: dateUnix,
        specialnotes: specialnotes
    })).data
    req.channel.send(discordHelper.compileRichEmbed([{
        title: 'Successfully hosted',
        message: `**${role}** training on **${dateString}** at **${timeString}**.`,
    }, {title: 'Training ID:', message: trainingId.toString()}]))
}

exports.hosttraining = async req => {
    await exports.host(req)
}

exports.finish = async req => {
    const id = parseInt(req.args[0])
    if (!id) throw new InputError('Please enter a training ID.')
    const username = req.member.nickname ? req.member.nickname : req.author.username
    const training = (await applicationAdapter('put', `/v1/groups/${config.groupId}/trainings/${id}`,
    {
        by: username
    })).data
    if (training) {
        req.channel.send(`Successfully finished Training ID **${id}**.`)
    } else {
        req.channel.send(`Couldn't finish Training ID **${id}**.`)
    }
}

exports.finishtraining = async req => {
    await exports.finish(req)
}

exports.canceltraining = async req => {
    const id = parseInt(req.args[0])
    if (!id) throw new InputError('Please enter a training ID.')
    const reason = stringHelper.extractText(req.message.content, '"')
    if (!reason) throw new InputError('Please enter a reason between *double* quotation marks.')
    const username = req.member.nickname ? req.member.nickname : req.author.username
    const training = (await applicationAdapter('put', `/v1/groups/${config.groupId}/trainings/${id}`,
        {
        cancelled: true,
        reason: reason,
        by: username
    })).data
    if (training) {
        req.channel.send(`Successfully cancelled Training ID **${id}**.`)
    } else {
        req.channel.send(`Couldn't cancel Training ID **${id}**.`)
    }
}

exports.changetraining = async req => {
    const id = parseInt(req.args[0])
    if (!id) throw new InputError('Please enter a Training ID.')
    let key = req.args[1]
    if (!key || key.indexOf(':') === -1) throw new InputError('Please give the key you want to change.')
    key = key.substring(0, key.indexOf(':')).toLowerCase()
    let changeData = req.message.content.substring(req.message.content.indexOf(':') + 1, req.message.content.length)
    if (key !== 'by' && key !== 'type' && key !== 'date' && key !== 'time' && key !== 'specialnotes') throw new
    InputError('That key is not valid.')
    const data = {}
    if (key === 'by') {
        data.by = await userHelper.getIdFromUsername(changeData)
    } else if (key === 'specialnotes') {
        const specialnotes = stringHelper.extractText(changeData, '"')
        if (!specialnotes) throw new InputError('Please enter new specialnotes between *double* quotation marks.')
        data.specialnotes = specialnotes
    } else if (key === 'type') {
        changeData = changeData.toLowerCase()
        if (!groupHelper.getRoleByAbbreviation(changeData)) throw new InputError(`Role abbreviaton **${changeData}** ` +
            'does not exist.')
        data.type = changeData
    } else if (key === 'date' || key === 'time') {
        const training = await groupHelper.getTrainingById(id)
        const unix = training.date * 1000
        let dateInfo
        let timeInfo
        if (key === 'date') {
            if (!timeHelper.validDate(changeData)) throw new InputError('Please enter a valid date.')
            timeInfo = timeHelper.getTimeInfo(timeHelper.getTime(unix))
            dateInfo = timeHelper.getDateInfo(changeData)
        } else {
            if (!timeHelper.validTime(changeData)) throw new InputError('Please enter a valid time.')
            dateInfo = timeHelper.getDateInfo(timeHelper.getDate(unix))
            timeInfo = timeHelper.getTimeInfo(changeData)
        }
        data.date = timeHelper.getUnix(new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day, timeInfo.hours,
            timeInfo.minutes))
    }
    const training = (await applicationAdapter('put', `/v1/groups/${config.groupId}/trainings/${id}`,
        data)).data
    if (training) {
        req.channel.send(`Successfully changed training with ID **${id}**.`)
    } else {
        req.channel.send(`Couldn't change training with ID **${id}**.`)
    }
}

exports.announce = async req => {
    await exports.announcediscord(req)
    await exports.announceroblox(req)
}

exports.announcediscord = async req => {
    const id = parseInt(req.args[0])
    const training = await groupHelper.getTrainingById(id)
    const content = await discordHelper.getChannel(req.guild, 'trainings').send(discordHelper
        .getTrainingAnnouncement(training, req.guild))
    req.channel.send(discordHelper.getEmbed('Successfully announced', content))
}

exports.announceroblox = async req => {
    const id = parseInt(req.args[0])
    if (!id) throw new InputError('Please enter a training ID.')
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    await applicationAdapter('post', `/v1/groups/${config.groupId}/shout`, {
        by: byUserId,
        message: groupHelper.defaultTrainingShout
    })
    req.channel.send(discordHelper.getEmbed('Successfully shouted', groupHelper.defaultTrainingShout))
}

exports.exampleshout = async req => {
    const id = parseInt(req.args[0])
    if (!id) throw new InputError('Please enter a training ID.')
    req.channel.send(discordHelper.getEmbed('Shout for Training ID ' + id, groupHelper.defaultTrainingShout))
}

exports.exampleannouncement = async req => {
    const id = parseInt(req.args[0])
    const training = await groupHelper.getTrainingById(id)
    req.channel.send(discordHelper.getEmbed('Announcement for Training ID ' + id , discordHelper
        .getTrainingAnnouncement(training, req.guild)).setFooter('Please note: Copying and pasting the ' +
            'announcement does NOT copy the layout.'))
}

exports.cancelsuspension = async req => {
    const username = req.args[0]
    if (!username) throw new InputError('Please enter a username.')
    const reason = stringHelper.extractText(req.message.content, '"')
    if (!reason) throw new InputError('Please enter a reason between *double* quotation marks.')
    const userId = await userHelper.getIdFromUsername(username)
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    const suspension = (await applicationAdapter('put', `/v1/groups/${config.groupId}/suspensions/` +
        userId, {
        cancelled: true,
        reason: reason,
        by: byUserId
    })).data
    if (suspension) {
        req.channel.send(`Successfully cancelled **${username}**'s suspension.`)
    } else {
        req.channel.send(`Couldn't cancel **${username}**'s suspension.`)
    }
}

exports.extend = async req => {
    const username = req.args[0]
    if (!username) throw new InputError('Please enter a username.')
    const reason = stringHelper.extractText(req.message.content, '"')
    if (!reason) throw new InputError('Please enter a reason between *double* quotation marks.')
    let extension = parseFloat(req.args[1])
    if (!extension) throw new InputError('Please enter a number amount of days!')
    extension = Math.round(extension)
    const userId = await userHelper.getIdFromUsername(username)
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    const suspension = (await applicationAdapter('put', `/v1/groups/${config.groupId}/suspensions/` +
        userId, {
        extended: true,
        duration: extension * 86400,
        reason: reason,
        by: byUserId
    })).data
    if (suspension) {
        req.channel.send(`Successfully cancelled **${username}**'s suspension.`)
    } else {
        req.channel.send(`Couldn't cancel **${username}**'s suspension.`)
    }
}

exports.extendsuspension = async req => {
    await exports.extend(req)
}

exports.changesuspension = async req => {
    const username = req.args[0]
    if (!username) throw new InputError('Please enter a username.')
    let key = req.args[1]
    if (!key || key.indexOf(':') === -1) throw new InputError('Please give the key you want to change.')
    key = key.substring(0, key.indexOf(':')).toLowerCase()
    let changeData = req.message.content.substring(req.message.content.indexOf(':') + 1, req.message.content.length)
    if (key !== 'by' && key !== 'reason' && key !== 'rankback') throw new InputError('That key is not valid.')
    const data = {}
    if (key === 'by') {
        data.by = await userHelper.getIdFromUsername(changeData)
    } else if (key === 'reason') {
        const reason = stringHelper.extractText(changeData, '"')
        if (!reason) throw new InputError('Please enter new reason between *double* quotation marks.')
        data.reason = reason
    } else if (key === 'rankback') {
        changeData = changeData.toLowerCase()
        if (changeData !== 'yes' && changeData !== 'no') throw new InputError(`**${changeData}** is not a valid ` +
            'value for rankback.')
        data.rankback = changeData === 'yes' ? 1 : 0
    }
    const userId = await userHelper.getIdFromUsername(username)
    const suspension = (await applicationAdapter('put', `/v1/groups/${config.groupId}/suspensions/` +
        userId, data)).data
    if (suspension) {
        req.channel.send(`Successfully changed **${username}**'s suspension.`)
    } else {
        req.channel.send(`Couldn't change **${username}**'s suspension.`)
    }
}

exports.cancel = req => {
    req.channel.send(`This is not a command, please specify if you want to ${req.command} a **training** or a ` +
        '**suspension**.')
}

exports.change = req => {
    exports.cancel(req)
}

exports.issuspended = async req => {
    const username = req.args[0]
    const userId = await userHelper.getIdFromUsername(username)
    const suspension = (await applicationAdapter('get', `/v1/groups/${config.groupId}/suspension/` +
        userId)).data
    if (suspension) {
        req.channel.send(`**${username}** is suspended.`)
    } else {
        req.channel.send(`**${username}** is not suspended.`)
    }
}

exports.unpban = async req => {
    const happywalker = discordHelper.getMemberByName(req.guild, 'Happywalker')
    if (req.member !== happywalker) throw new PermissionError()
    const username = req.args[0]
    const userId = await userHelper.getIdFromUsername(username)
    const byUserId = await userHelper.getIdFromUsername(req.member.nickname ? req.member.nickname : req.author
        .username)
    await applicationAdapter('put', `/v1/bans/${userId}`, {
        unbanned: true,
        by: byUserId
    })
    req.channel.send(`Successfully unbanned **${username}**.`)
}

exports.pbanlist = async req => {
    const bans = (await applicationAdapter('get', '/v1/bans')).data
    const banEmbeds = discordHelper.getBanEmbeds(bans)
    const channel = await req.member.createDM()
    for (const embed of banEmbeds) {
        await channel.send(embed)
    }
}
