'use strict'
require('dotenv').config()

const discord = require('discord.js')
const sleep = require('sleep')

const base = require('path').resolve('.')

const timeHelper = require('../helpers/time')
const discordHelper = require('../helpers/discord')
const randomHelper = require('../helpers/random')

const InputError = require('../errors/input-error')
const ApplicationError = require('../errors/application-error')
const PermissionError = require('../errors/permission-error')

const commands = require('../commands')

const activities = require('../content/activities')

const config = require(base + "/config/application")

const client = new discord.Client()

client.on('ready', async () => {
    exports.startUnix = timeHelper.getUnix()
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`)
    await exports.setActivity(randomHelper.getRandomInt(activities.length))
})

client.on('error', async err => {
    console.error(err)
    await exports.restart(client)
})

client.on('message', async message => {
    if (message.author.bot) return
    if (!message.content.startsWith(config.prefix)) return
    let args = message.content.split(' ')
    const command = args[0].slice(1)
    args.shift()
    for (const [title, controller] of Object.entries(commands)) {
        if (controller[command]) {
            const req = {
                guild: message.guild,
                channel: message.channel,
                member: message.member,
                author: message.author,
                message: message,
                command: command,
                args: args
            }
            try {
                if (title === 'hr' && !discordHelper.hasRole(req.member, 'HR')) throw new PermissionError()
                await controller[command](req)
            } catch (err) {
                if (err instanceof InputError) {
                    req.channel.send(err.message)
                } else if (err instanceof ApplicationError) {
                    req.channel.send(discordHelper.getEmbed(req.command, err.message))
                } else if (err instanceof PermissionError) {
                    req.channel.send('Insufficient powers!')
                } else {
                    console.log(err)
                    if (err.response.status === 500) {
                        console.error(err.message)
                        req.channel.send('An error occurred!')
                    } else {
                        req.channel.send(discordHelper.getEmbed(req.command, err.response.data.errors[0].message))
                    }
                }
            }
            await exports.log(req)
            break
        }
    }
})

exports.login = async () => {
    try {
        await client.login(process.env.DISCORD_TOKEN)
        console.log('Client logged in!')
    } catch (err) {
        console.error(err)
        await exports.restart(client)
    }
}

exports.restart = async client => {
    try {
        await client.destroy()
        await exports.login()
    } catch (err) {
        console.error(err)
        await sleep.sleep(config.restartDelay)
        await exports.restart(client)
    }
}

exports.setActivity = async num => {
    try {
        exports.currentActivityNumber = num
        const activity = activities[exports.currentActivityNumber]
        await client.user.setActivity(activity.name, activity.options)
        return `**${discordHelper.getActivityFromNumber(activity.options.type)}** ${activity.name}`
    } catch (err) {
        console.error(err)
    }
}

exports.log = async req => {
    try {
        (await discordHelper.getChannel(req.guild, 'nsadmin_logs')).send(discordHelper.getEmbed(`**${req
            .member.nickname ? req.member.nickname : req.author.username}** used command **${req.command}**!`, req
            .message.content))
    } catch (err) {
        console.error(err.message)
    }
}
