'use strict'

const BaseCommand = require('../base')

const { applicationAdapter } = require('../../adapters')
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
      requiresApi: true,
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
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData()).robloxId
    if (typeof authorId === 'undefined') {
      return message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/trainings/${trainingId}/cancel`, {
      authorId,
      reason
    })

    return message.reply(`Successfully cancelled training with ID **${trainingId}**.`)
  }
}

module.exports = CancelTrainingCommand
