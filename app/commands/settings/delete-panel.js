'use strict'
const BaseCommand = require('../base')

class DeletePanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletepanel',
      aliases: ['deletepnl', 'delpanel', 'delpnl'],
      description: 'Deletes a panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panelName',
        prompt: 'What panel would you like to delete?',
        type: 'striing'
      }]
    })
  }

  async run (message, { panelName }) {
    await message.guild.panels.delete(panelName)

    return message.reply('Successfully deleted panel.')
  }
}

module.exports = DeletePanelCommand
