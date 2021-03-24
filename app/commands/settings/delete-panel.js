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
        key: 'panel',
        prompt: 'What panel would you like to delete?',
        type: 'panel'
      }]
    })
  }

  async run (message, { panel }) {
    await message.guild.panels.delete(panel)

    return message.reply('Successfully deleted panel.')
  }
}

module.exports = DeletePanelCommand
