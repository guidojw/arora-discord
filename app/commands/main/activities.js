'use strict'
const Command = require('../../controllers/command')
const activities = require('../../content/activities')
const discordService = require('../../services/discord')
const BotEmbed = require('../../views/bot-embed')

module.exports = class ActivitiesCommand extends Command {
    constructor (client) {
        super(client, {
            group: 'main',
            name: 'activities',
            description: 'Lists all activities.',
            clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
        })
    }

    execute (message) {
        let activitiesString = ''
        for (const [index, activity] of Object.entries(activities)) {
            activitiesString += `${parseInt(index) + 1}. **${discordService.getActivityFromNumber(activity.options.type)
            }** ${activity.name}\n`
        }
        const embed = new BotEmbed()
            .addField('Activities', activitiesString)
        message.replyEmbed(embed)
    }
}
