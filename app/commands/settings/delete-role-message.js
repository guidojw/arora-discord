'use strict'
const BaseCommand = require('../base')

class DeleteRoleMessageCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deleterolemessage',
      aliases: ['delrolemessage', 'deleterolemsg', 'delrolemsg'],
      description: 'Deletes a role message.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleMessage',
        prompt: 'What role message would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async run (message, { roleMessage }) {
    await message.guild.roleMessages.delete(roleMessage)

    return message.reply('Successfully deleted role message.')
  }
}

module.exports = DeleteRoleMessageCommand
