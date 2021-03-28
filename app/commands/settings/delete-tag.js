'use strict'

const BaseCommand = require('../base')

class DeleteTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetag',
      aliases: ['deltag'],
      description: 'Deletes a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        prompt: 'What tag would you like to delete?',
        type: 'tag'
      }]
    })
  }

  async run (message, { tag }) {
    await message.guild.tags.delete(tag)

    return message.reply('Successfully deleted tag.')
  }
}

module.exports = DeleteTagCommand
