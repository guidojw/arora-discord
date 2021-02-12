'use strict'
const BaseCommand = require('../base')

const { Panel } = require('../../models')

class DeletePanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletepanel',
      aliases: ['deletepnl', 'delpanel', 'delpnl'],
      description: 'Deletes a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panelId',
        prompt: 'What panel would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async run (message, { panelId }) {
    const panel = await Panel.findOne({ where: { id: panelId, guildId: message.guild.id } })
    if (!panel) {
      return message.reply('Panel not found.')
    }

    await panel.destroy()

    return message.reply('Successfully deleted panel.')
  }
}

module.exports = DeletePanelCommand
