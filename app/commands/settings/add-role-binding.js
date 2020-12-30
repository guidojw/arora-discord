'use strict'
const BaseCommand = require('../base')

const { RoleBinding } = require('../../models')

class AddRoleBindingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addrolebinding',
      aliases: ['addrolebnd'],
      description: 'Adds a new Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'role',
        prompt: 'To what role would you like to bind this binding?',
        type: 'role'
      }, {
        key: 'min',
        prompt: 'What do you want the lower limit of this binding to be?',
        type: 'integer',
        validate: _validateRank
      }, {
        key: 'max',
        prompt: 'What do you want the upper limit of this binding to be? Reply with "0" if you don\'t want one.',
        type: 'integer',
        validate: _validateRank
      }]
    })
  }

  async execute (message, { role, min, max }, guild) {
    if (guild.robloxGroupId) {
      max = max === 0 ? undefined : max
      if (typeof max !== 'undefined' && max < min) {
        [min, max] = [max, min]
      }

      const [, created] = await RoleBinding.findOrCreate({
        where: {
          robloxGroupId: guild.robloxGroupId,
          guildId: guild.id,
          roleId: role.id,
          min,
          max: max ?? null
        }
      })
      if (!created) {
        return message.reply('A role message with that message and range already exists.')
      }

      return message.reply('Successfully added role binding.')
    } else {
      return message.reply('This server is not bound to a Roblox group yet!')
    }
  }
}

function _validateRank (value) {
  return (value >= 0 && value <= 255) || 'Invalid rank.'
}

module.exports = AddRoleBindingCommand
