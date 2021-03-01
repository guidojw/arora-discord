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
        key: 'name',
        prompt: 'What panel would you like to delete?',
        type: 'string'
      }]
    })
  }

  async run (message, { name }) {
    await message.guild.panels.delete(name)

    return message.reply('Successfully deleted panel.')
  }
}

module.exports = DeletePanelCommand
