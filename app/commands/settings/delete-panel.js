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
        key: 'idOrName',
        prompt: 'What panel would you like to delete?',
        type: 'integer|string'
      }]
    })
  }

  async run (message, { idOrName }) {
    await message.guild.panels.delete(idOrName)

    return message.reply('Successfully deleted panel.')
  }
}

module.exports = DeletePanelCommand
