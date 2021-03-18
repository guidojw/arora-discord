'use strict'
const BaseCommand = require('../base')

const { RoleMessage } = require('../../models')

class DeleteRoleMessageCommand extends BaseCommand {
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

  async run (message, { roleMessageId }) {
    const roleMessage = await RoleMessage.findOne({ where: { id: roleMessageId, guildId: message.guild.id } })
    if (!roleMessage) {
      return message.reply('Role message not found.')
    }

    await roleMessage.destroy()

    return message.reply('Successfully deleted role message.')
  }
}

module.exports = DeleteRoleMessageCommand