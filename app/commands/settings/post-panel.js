'use strict'
const BaseCommand = require('../base')

const { validateNoneOrType, parseNoneOrType } = require('../../util').argumentUtil

class PostPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'postpanel',
      aliases: ['postpnl'],
      description: 'Posts a panel in a channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to post?',
        type: 'panel'
      }, {
        key: 'channel',
        prompt: 'In what channel do you want to post this panel? Reply with "none" if you want to remove the panel ' +
          'from the channel it\'s posted in.',
        type: 'text-channel',
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }]
    })
  }

  async run (message, { panel, channel }) {
    panel = await message.guild.panels.post(panel, channel)

    return message.reply(channel
      ? `Successfully posted panel \`${panel.name}\` in ${channel}.`
      : `Successfully removed panel \`${panel.name}\` from channel.`
    )
  }
}

module.exports = PostPanelCommand
