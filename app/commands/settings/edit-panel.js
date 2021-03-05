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
        key: 'idOrName',
        prompt: 'What panel would you like to edit?',
        type: 'integer|string'
      }, {
        key: 'content',
        prompt: 'What would you like to change the panel\'s content to?',
        type: 'json-object',
        validate: validateContent
      }]
    })
  }

  async run (message, { idOrName, content }) {
    const panel = message.guild.panels.resolve(idOrName)
    if (!panel) {
      return message.reply('Panel not found.')
    }

    await panel.update({ content })

    return message.reply(`Successfully edited panel **${panel.name}**.`)
  }
}

function validateContent (val, msg) {
  const valid = this.type.validate(val, msg, this)
  return !valid || typeof valid === 'string'
    ? valid
    : Object.prototype.toString.call(val) === '[object Object]'
}

module.exports = EditPanelCommand
