'use strict'
const Command = require('../../controllers/command')
const votingService = require('../../services/voting')

module.exports = class ShowVoteCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'voting',
      name: 'showvote',
      aliases: ['vshow'],
      description: 'Posts a mock of what the vote posted by the startvote command will look like.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  async execute (message, _args, guild) {
    const voteData = guild.getData('vote')
    if (!voteData) {
      return message.reply('There\'s no vote created yet, create one using the createvote command.')
    }
    const messages = await votingService.getVoteMessages(voteData, this.client)

    await message.reply('The vote will look like this:')
    await message.channel.send(messages.intro.content, messages.intro.options)
    for (const option of Object.values(messages.options)) {
      const optionMessage = await message.channel.send(option.content, option.options)
      optionMessage.react('✏️')
    }
    await message.channel.send(messages.info.content, messages.info.options)
    await message.channel.send(messages.timer.content, messages.timer.options)
  }
}
