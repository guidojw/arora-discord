'use strict'
const Command = require('../../controllers/command')

const { RoleMessage } = require('../../models')

class DeleteRoleMessageCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deleterolemessage',
      aliases: ['delrolemessage', 'deleterolemsg', 'delrolemsg'],
      description: 'Deletes a role message.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleMessageId',
        prompt: 'What role message would you like to delete?',
        type: 'integer'
      }]
    })
  }

  async execute (message, { roleMessageId }) {
    const roleMessage = await RoleMessage.findByPk(roleMessageId)
    if (!roleMessage) {
      return message.reply('Role message not found.')
    }

    await roleMessage.destroy()

    return message.reply('Successfully deleted role message.')
  }
}

module.exports = DeleteRoleMessageCommand
