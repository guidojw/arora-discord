'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { applicationAdapter } = require('../../adapters')
const { groupService, userService } = require('../../services')
const { getDate, getTime, getTimeZoneAbbreviation } = require('../../util').timeUtil

class TrainingsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'trainings',
      aliases: ['traininglist', 'training', 'traininginfo'],
      description: 'Lists info of all trainings/training with given ID.',
      clientPermissions: ['SEND_MESSAGES'],
      details: 'TrainingId must be the ID of a currently scheduled training.',
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Of which training would you like to know the information?',
        default: ''
      }]
    })
  }

  async run (message, { trainingId }) {
    if (trainingId) {
      const training = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}`))
        .data
      const username = (await userService.getUser(training.authorId).name)
      const date = new Date(training.date)

      const embed = new MessageEmbed()
        .setTitle(`Training ${training.id}`)
        .addField('Type', training.type.abbreviation, true)
        .addField('Date', getDate(date), true)
        .addField('Time', `${getTime(date)} ${getTimeZoneAbbreviation(date)}`, true)
        .addField('Host', username, true)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    } else {
      const trainings = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/trainings?sort=date`))
        .data
      if (trainings.length === 0) {
        return message.reply('There are currently no hosted trainings.')
      }

      const embeds = await groupService.getTrainingEmbeds(trainings)
      for (const embed of embeds) {
        await message.author.send(embed)
      }
      return message.reply('Sent you a DM with the upcoming trainings.')
    }
  }
}

module.exports = TrainingsCommand
