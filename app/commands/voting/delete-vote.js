'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

const { stripIndents } = require('common-tags')

module.exports = class DeleteVoteCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'voting',
      name: 'deletevote',
      aliases: ['vdelete'],
      description: 'Deletes the currently created vote.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  async execute (message, _args, guild) {
    const voteData = guild.getData('vote')
    if (!voteData) {
      return message.reply('There is no created vote.')
    }
    if (voteData.timer && voteData.timer.end > Date.now()) {
      return message.reply('The vote hasn\'t ended yet.')
    }

    const prompt = await message.reply(stripIndents`
    Are you sure you would like to delete the created vote?
    **You won\'t be able to use the results and showvote commands anymore!**
    `)
    const choice = await discordService.prompt(message.channel, message.author, prompt, ['✅', '🚫']) === '✅'

    if (choice) {
      guild.setData('vote', undefined)

      message.reply('Deleted vote.')
    } else {
      message.reply('Didn\'t delete vote.')
    }
  }
}
