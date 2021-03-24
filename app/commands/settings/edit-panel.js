'use strict'
const BaseCommand = require('../base')

class EditPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'editpanel',
      aliases: ['editpnl'],
      description: 'Edits a panel\'s content.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panel',
        prompt: 'What panel would you like to edit?',
        type: 'panel'
      }, {
        key: 'content',
        prompt: 'What would you like to change the panel\'s content to?',
        type: 'json-object',
        validate: validateContent
      }]
    })
  }

  async run (message, { panel, content }) {
    panel = await message.guild.panels.update(panel, { content })

    return message.reply(`Successfully edited panel \`${panel.name}\`.`)
  }
}

function validateContent (val, msg) {
  const valid = this.type.validate(val, msg, this)
  return !valid || typeof valid === 'string'
    ? valid
    : Object.prototype.toString.call(this.type.parse(val, msg, this)) === '[object Object]'
}

module.exports = EditPanelCommand
