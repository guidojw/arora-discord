'use strict'
const BaseCommand = require('../base')

class CreateRoleBindingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'createrolebinding',
      aliases: ['createrolebnd'],
      description: 'Creates a new Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'role',
        prompt: 'To what role would you like to bind this binding?',
        type: 'role'
      }, {
        key: 'min',
        prompt: 'What do you want the lower limit of this binding to be?',
        type: 'integer',
        validate: validateMin
      }, {
        key: 'max',
        prompt: 'What do you want the upper limit of this binding to be? Reply with "none" if you don\'t want one.',
        type: 'integer',
        validate: validateMax,
        parse: parseMax
      }]
    })
  }

  async run (message, { role, min, max }) {
    const roleBinding = await message.guild.roleBindings.create({ role, min, max })

    return message.reply(`Successfully bound group **${roleBinding.robloxGroupId}** rank ${getRangeString(roleBinding.min, roleBinding.max)} to role ${roleBinding.role}.`)
  }
}

function validateMin (val, msg) {
  const valid = this.type.validate(val, msg, this)
  if (!valid || typeof valid === 'string') {
    return valid
  }
  val = parseInt(val)
  return (val >= 0 && val <= 255) || 'Invalid rank.'
}

function validateMax (val, msg) {
  return val === 'none' || validateMin.call(this, val, msg)
}

function parseMax (val, msg) {
  return val === 'none' ? undefined : this.type.parse(val, msg, this)
}

function getRangeString (min, max) {
  return `${max ? '[' : ''}**${min}**${max ? `, **${max}**]` : ''}`
}

module.exports = CreateRoleBindingCommand
