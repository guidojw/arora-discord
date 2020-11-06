'use strict'
const Command = require('../../controllers/command')

module.exports = class AddOptionCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'voting',
      name: 'addoption',
      aliases: ['vadd'],
      description: 'Adds given user as an option to vote at.',
      examples: ['addoption', 'addoption Guido "Hi, my name is Joe."'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'user',
        type: 'user',
        prompt: 'Who would you like to add as option?'
      }, {
        key: 'description',
        type: 'string',
        prompt: 'What would you like the description of this user to be?'
      }]
    })
  }

  execute (message, { user, description }, guild) {
    const voteData = guild.getData('vote')
    if (!voteData) {
      return message.reply('There\'s no vote created yet, create one using the createvote command.')
    }
    if (voteData.timer) {
      return message.reply('The vote has already been started.')
    }
    if (user.id in voteData.options) {
      return message.reply('User is already an option.')
    }

    voteData.options[user.id] = { description: description, votes: [] }
    guild.setData('vote', voteData)

    message.reply('Added option.')
  }
}
