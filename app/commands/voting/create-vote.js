'use strict'
const BaseCommand = require('../base')

module.exports = class CreateVoteCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'voting',
      name: 'createvote',
      aliases: ['vcreate'],
      description: 'Creates a vote with given name and description.',
      examples: ['createvote', 'createvote "Moderator Elections" "We are organising a vote. Please vote on your ' +
      'favorite participant!"'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'title',
        type: 'string',
        prompt: 'What would you like the title of the vote to be?'
      }, {
        key: 'description',
        type: 'string',
        prompt: 'What would you like the description of the vote to be?'
      }]
    })
  }

  execute (message, { title, description }, guild) {
    if (guild.getData('vote')) {
      return message.reply('There\'s already a vote created.')
    }

    const voteData = { title: title, description: description, options: {} }
    if (message.attachments.size > 0) {
      voteData.image = message.attachments[0].url
    }
    guild.setData('vote', voteData)

    message.reply('Created vote.')
  }
}
