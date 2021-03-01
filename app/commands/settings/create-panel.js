'use strict'
const BaseCommand = require('../base')

class CreatePanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createpanel',
      aliases: ['createpnl'],
      description: 'Creates a new panel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the panel to be?',
        type: 'string'
      }, {
        key: 'content',
        prompt: 'What do you want the content of the panel to be?',
        type: 'string'
      }]
    })
  }

  async run (message, { name, content }) {
    const panel = await message.guild.panels.create(name, content)

    return message.reply(`Successfully created panel **${panel.name}**.`)
  }
}

module.exports = CreatePanelCommand
