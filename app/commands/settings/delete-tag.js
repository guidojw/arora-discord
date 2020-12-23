'use strict'
const Command = require('../../controllers/command')

const { Tag, TagName } = require('../../models')

class DeleteTagCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetag',
      aliases: ['deltag'],
      description: 'Deletes a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What tag would you like to delete?',
        type: 'string',
        validate: _validateName
      }]
    })
  }

  async execute (message, { name }, guild) {
    name = name.toLowerCase()
    const tag = await Tag.findOne({
      where: { guildId: guild.id },
      include: [{ model: TagName, as: 'names', where: { name } }]
    })
    if (!tag) {
      return message.reply('Tag not found.')
    }

    await tag.destroy()

    return message.reply(`Successfully deleted tag **${tag.names[0]?.name ?? 'Unknown'}**.`)
  }
}

function _validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = DeleteTagCommand
