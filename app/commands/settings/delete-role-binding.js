'use strict'
const BaseCommand = require('../base')

class DeleteRoleBindingCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deleterolebinding',
      aliases: ['delrolebinding', 'deleterolebnd', 'delrolebnd'],
      description: 'Deletes a Roblox rank to Discord role binding.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleBinding',
        prompt: 'What role binding would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async run (message, { roleBinding }) {
    await message.guild.roleBindings.delete(roleBinding)

    return message.reply('Successfully deleted role binding.')
  }
}

module.exports = DeleteRoleBindingCommand
