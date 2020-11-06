'use strict'
const Command = require('../../controllers/command')
const applicationAdapter = require('../../adapters/application')
const groupService = require('../../services/group')
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../../config/application')

module.exports = class TrainingsCommand extends Command {
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

  async execute (message, { trainingId }) {
    if (trainingId) {
      const training = (await applicationAdapter('get', `/v1/groups/${applicationConfig.groupId}/trainings/${trainingId}`))
        .data
      const embed = new MessageEmbed()
        .addField(`Training ${training.id}`, await groupService.getTrainingSentence(training))
        .setColor(applicationConfig.primaryColor)
      message.replyEmbed(embed)
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
      message.reply('Sent you a DM with the upcoming trainings.')
    }
  }
}
