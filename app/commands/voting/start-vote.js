'use strict'
const Command = require('../../controllers/command')
const timeHelper = require('../../helpers/time')
const discordService = require('../../services/discord')

module.exports = class StartVoteCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'voting',
            name: 'startvote',
            aliases: ['vstart'],
            description: 'Starts the vote created using the createvote command.',
            examples: ['startvote', 'startvote #announcements 12-3-2020 20:00'],
            clientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
            args: [{
                key: 'channel',
                type: 'channel',
                prompt: 'In what channel would you like to hold the vote?'
            }, {
                key: 'date',
                type: 'string',
                prompt: 'At what date do you want the vote to end?',
                validate: timeHelper.validDate
            }, {
                key: 'time',
                type: 'string',
                prompt: 'At what time on given date would you like the vote to end?',
                validate: timeHelper.validTime
            }]
        })
    }

    async execute (message, { channel, date, time }, guild) {
        const voteData = guild.getData('vote')
        if (!voteData) return message.reply('There\'s no vote created yet, create one using the createvote command.')
        if (voteData.timer) return message.reply('The vote has already started.')
        const dateInfo = timeHelper.getDateInfo(date)
        const timeInfo = timeHelper.getTimeInfo(time)
        const dateUnix = new Date(dateInfo.year, dateInfo.month, dateInfo.day, timeInfo.hours, timeInfo.minutes)
            .getTime()
        const afterNow = dateUnix - Date.now() > 0
        if (!afterNow) return message.reply('Please give a date and time that are after now.')

        voteData.channel = channel.id
        voteData.timer = { end: dateUnix }
        const messages = await discordService.getVoteMessages(voteData, this.client)
        await channel.send(messages.intro.content, messages.intro.options)
        for (const [id, option] of Object.entries(messages.options)) {
            const optionMessage = await channel.send(option.content, option.options)
            optionMessage.react('✏️')
            voteData.options[id].message = optionMessage.id
        }
        await channel.send(messages.info.content, messages.info.options)
        const timerMessage = await channel.send(messages.timer.content, messages.timer.options)
        voteData.timer.message = timerMessage.id
        guild.setData('vote', voteData)
        guild.scheduleJob('saveVoteJob')
        guild.scheduleJob('updateTimerJob')
        message.reply(`Posted the vote in ${channel}.`)
    }
}
