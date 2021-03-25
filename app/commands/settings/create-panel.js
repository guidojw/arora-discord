'use strict'
const BaseCommand = require('../base')

const { validators, isObject, noNumber, noSpaces } = require('../../util').argumentUtil

class CreatePanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createpanel',
      aliases: ['createpnl'],
      description: 'Creates a new panel.',
      details: 'For the content argument, you should input a JSON format embed object. You can use the Embed ' +
        'Visualizer at <https://leovoel.github.io/embed-visualizer/> to create one. When finished, copy the object ' +
        '(denoted with {}) on the left output screen after "embed: ".',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the panel to be?',
        type: 'string',
        validate: validators([noNumber, noSpaces])
      }, {
        key: 'content',
        prompt: 'What do you want the content of the panel to be?',
        type: 'json-object',
        validate: validators([isObject])
      }]
    })
  }

  async run (message, { name, content }) {
    const panel = await message.guild.panels.create(name, content)

    return message.reply(`Successfully created panel \`${panel.name}\`.`)
  }
}

module.exports = CreatePanelCommand
