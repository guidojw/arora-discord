'use strict'
const BaseCommand = require('../base')

const { RoleBinding } = require('../../models')

class DeleteRoleBindingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deleterolebinding',
      aliases: ['delrolebinding', 'deleterolebnd', 'delrolebnd'],
      description: 'Deletes a Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleBindingId',
        prompt: 'What role binding would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async run (message, { roleBindingId }) {
    const roleBinding = await RoleBinding.findByPk(roleBindingId)
    if (!roleBinding) {
      return message.reply('Role binding not found.')
    }

    await roleBinding.destroy()

    return message.reply('Successfully deleted role binding.')
  }
}

module.exports = DeleteRoleBindingCommand
