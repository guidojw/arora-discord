'use strict'
const BaseCommand = require('../base')

class PostPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'postpanel',
      aliases: ['postpnl'],
      description: 'Posts a panel in a channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'idOrName',
        prompt: 'What panel would you like to post?',
        type: 'integer|string'
      }, {
        key: 'channel',
        prompt: 'In what channel do you want to post this panel? Reply with "none" if you want to remove the panel ' +
          'from the channel it\'s posted in.',
        type: 'text-channel',
        validate: validateChannel,
        parse: parseChannel
      }]
    })
  }

  async run (message, { idOrName, channel }) {
    const panel = await message.guild.panels.post(idOrName, channel)

    return message.reply(channel
      ? `Successfully posted panel **${panel.name}** in ${channel}.`
      : `Successfully removed panel **${panel.name}** from channel.`
    )
  }
}

function validateChannel (val, msg) {
  return val === 'none' || this.type.validate(val, msg, this)
}

function parseChannel (val, msg) {
  return val === 'none' ? undefined : this.type.parse(val, msg, this)
}

module.exports = PostPanelCommand
