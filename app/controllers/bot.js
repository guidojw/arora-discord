'use strict'
require('dotenv').config()

const { Client, RichEmbed } = require('discord.js')
const sleep = require('sleep')

const discordService = require('../services/discord')

const timeHelper = require('../helpers/time')
const randomHelper = require('../helpers/random')

const InputError = require('../errors/input-error')
const ApplicationError = require('../errors/application-error')
const PermissionError = require('../errors/permission-error')

const commands = require('../commands')

const activities = require('../content/activities')

const applicationConfig = require('../../config/application')
const guildConfigs = require('../../config/guilds')

const client = new Client()

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
    const config = guildConfigs[message.guild.id]
    if (!config) return
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
                args: args,
                client: client,
                config: config
            }
            try {
                if (title === 'hr' && !discordService.hasRole(req.member, 'HR')) throw new PermissionError()
                await controller[command](req)
            } catch (err) {
                console.error(err)
                if (err instanceof InputError) {
                    await req.channel.send(err.message)
                } else if (err instanceof ApplicationError) {
                    await req.channel.send(discordService.getEmbed(req.command, err.message))
                } else if (err instanceof PermissionError) {
                    await req.channel.send('Insufficient powers!')
                } else {
                    if (err.response.status === 500) {
                        await req.channel.send('An error occurred!')
                    } else {
                        await req.channel.send(discordService.getEmbed(req.command, err.response.data.errors[0].message)
                        )
                    }
                }
            }
            await exports.log(req)
            break
        }
    }
})

client.on('guildMemberAdd', async member => {
    const config = guildConfigs[member.guild.id]
    if (!config) return
    const embed = new RichEmbed()
        .setTitle(`Hey ${member.user.tag},`)
        .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL)
    member.guild.channels.find(channel => channel.id === config.channels.welcome).send(embed)
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
        await sleep.sleep(applicationConfig.restartDelay)
        await exports.login()
    } catch (err) {
        console.error(err)
        await exports.restart(client)
    }
}

exports.setActivity = async num => {
    try {
        exports.currentActivityNumber = num
        const activity = activities[exports.currentActivityNumber]
        await client.user.setActivity(activity.name, activity.options)
        return `**${discordService.getActivityFromNumber(activity.options.type)}** ${activity.name}`
    } catch (err) {
        console.error(err)
    }
}

exports.log = async req => {
    try {
        (await discordService.getChannel(req.guild, 'nsadmin_logs')).send(discordService.getEmbed(`**${req
            .member.nickname ? req.member.nickname : req.author.username}** used command **${req.command}**!`, req
            .message.content))
    } catch (err) {
        console.error(err.message)
    }
}
