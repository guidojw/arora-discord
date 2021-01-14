'use strict'
const applicationAdapter = require('../../adapters/application')
const BaseCommand = require('../base')
const groupService = require('../../services/group')

const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

class TrainingsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'trainings',
      aliases: ['traininglist', 'training', 'traininginfo'],
      description: 'Lists info of all trainings/training with given ID.',
      clientPermissions: ['SEND_MESSAGES'],
      details: 'TrainingId must be the ID of a currently scheduled training.',
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
      const training = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/trainings/${trainingId}`))
        .data

      const embed = new MessageEmbed()
        .addField(`Training ${training.id}`, await groupService.getTrainingSentence(training))
        .setColor(message.guild.getData('primaryColor'))
      return message.replyEmbed(embed)
    } else {
      const trainings = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/trainings?sort=date`))
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
