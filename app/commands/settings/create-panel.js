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
        type: 'string',
        validate: validateName
      }, {
        key: 'content',
        prompt: 'What do you want the content of the panel to be?',
        type: 'json-object',
        validate: validateContent
      }]
    })
  }

  async run (message, { name, content }) {
    const panel = await message.guild.panels.create(name, content)

    return message.reply(`Successfully created panel **${panel.name}**.`)
  }
}

function validateName (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  return !isNaN(parseInt(val))
    ? 'Name cannot be a number.'
    : val.includes(' ')
      ? 'Name cannot include spaces.'
      : true
}

function validateContent (val, msg) {
  const valid = this.type.validate(val, msg, this)
  return !valid || typeof valid === 'string'
    ? valid
    : Object.prototype.toString.call(this.type.parse(val, msg, this)) === '[object Object]'
}

module.exports = CreatePanelCommand
