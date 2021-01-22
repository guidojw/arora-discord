'use strict'
const BaseCommand = require('../base')

const { Panel } = require('../../models')

class RawPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'rawpanel',
      aliases: ['rawpnl'],
      description: 'Posts the raw content of a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panelId',
        prompt: 'What panel ID would you like to know the raw content of?',
        type: 'integer'
      }]
    })
  }

  async run (message, { panelId  }) {
    const panel = await Panel.findByPk(panelId)
    if (!panel) {
      return message.reply('Panel not found.')
    }

    return message.reply(panel.content, { allowedMentions: { users: [message.author.id] } })
  }
}

module.exports = RawPanelCommand
