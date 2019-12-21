'use strict'
const base = require('path').resolve('.')

const discordHelper = require('../helpers/discord')
const timeHelper = require('../helpers/time')

const applicationAdapter = require('../adapters/application')

const InputError = require('../errors/input-error')

const config = require(base + '/config/application')

exports.rr = req => {
    req.channel.send(`<${config.rulesRegulationsLink}> - Rules & Regulations`)
}

exports.rulesregulations = req => {
    exports.rr(req)
}

exports.group = req => {
    req.channel.send(`<${config.groupLink}> - Group Page`)
}

exports.grouppage = req => {
    exports.group(req)
}

exports.grouplink = req => {
    exports.group(req)
}

exports.game = req => {
    req.channel.send(`<${config.gameLink}> - Game Page`)
}

exports.gamepage = req => {
    exports.game(req)
}

exports.trello = req => {
    req.channel.send(`<${config.trelloLink}> - Trello Dev Board`)
}

exports.ttdt = req => {
    req.channel.send(`<${config.theoreticalTrainDriverTestLink}> - Theoretical Train Driver Test II`)
}

exports.theoretical = req => {
    exports.ttdt(req)
}

exports.ptdt = req => {
    req.channel.send(`<${config.practicalTrainDriverTestLink}> - Practical Train Driver Test II`)
}

exports.practical = req => {
    exports.ptdt(req)
}

exports.time = async req => {
    let date
    if (req.args[0]) {
        const timezone = await timeHelper.getPlaceFromTimezone(req.args[0])
        if (!timezone) throw new InputError(`Unknown Timezone: '**${req.args[0]}**'`)
        date = timeHelper.getTimeInTimezone(timezone)
    } else {
        date = timeHelper.getTimeInTimezone('Europe/Amsterdam')
    }
    const hours = ('0' + date.getHours()).slice(-2)
    const minutes = ('0' + date.getMinutes()).slice(-2)
    const timeString = hours + ':' + minutes
    req.channel.send(discordHelper.getEmbed('time', timeString))
}

exports.date = async req => {
    let date
    if (req.args[0]) {
        const timezone = await timeHelper.getPlaceFromTimezone(req.args[0])
        if (!timezone) throw new InputError(`Unknown Timezone: '**${req.args[0]}**'`)
        date = timeHelper.getTimeInTimezone(timezone)
    } else {
        date = timeHelper.getTimeInTimezone('Europe/Amsterdam')
    }
    req.channel.send(discordHelper.getEmbed('date', date.toString()))
}

exports.unix = req => {
    req.channel.send(discordHelper.getEmbed(req.command, timeHelper.getUnix()))
}

exports.epoch = req => {
    exports.unix(req)
}

exports.groupcenter = req => {
    req.channel.send(`<${config.groupCenterLink}> - Group Center`)
}

exports.groupcentre = req => {
    exports.groupcenter(req)
}

exports.gc = req => {
    exports.groupcenter(req)
}

exports.discord = req => {
    req.channel.send(`${config.discordLink}`)
}

exports.isdst = req => {
    req.channel.send(timeHelper.isDst(timeHelper.getUnix()))
}

exports.isloggedin = async req => {
    try {
        req.channel.send((await applicationAdapter('get', '/v1/status')).data)
    } catch (err) {
        req.channel.send(false)
    }
}
