'use strict'
const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
const { userService } = require('../../services')
const { validators, noChannels, noTags, noUrls } = require('../../util').argumentUtil

class CancelTrainingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'admin',
      name: 'canceltraining',
      details: 'TrainingId must be the ID of a currently scheduled training.',
      description: 'Cancels given training.',
      examples: ['canceltraining 1 Weird circumstances.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresRobloxGroup: true,
      args: [{
        key: 'trainingId',
        type: 'integer',
        prompt: 'Which training would you like to cancel?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to cancel this training?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  async run (message, { trainingId, reason }) {
    const authorId = await userService.getIdFromUsername(message.member.displayName)

    await applicationAdapter('post', `/v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}/cancel`, {
      authorId,
      reason
    })

    return message.reply(`Successfully cancelled training with ID **${trainingId}**.`)
  }
}

module.exports = CancelTrainingCommand
