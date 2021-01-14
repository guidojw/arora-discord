'use strict'
const BaseCommand = require('../base')

const { Tag, TagName } = require('../../models')

class EditTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'edittag',
      description: 'Edits a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What tag would you like to edit?',
        type: 'string',
        validate: _validateName
      }, {
        key: 'content',
        prompt: 'What do you want the new content of this tag to be?',
        type: 'string'
      }]
    })
  }

  async run (message, { name, content }) {
    name = name.toLowerCase()
    const tag = await Tag.findOne({
      where: { guildId: message.guild.id },
      include: [{ model: TagName, as: 'names', where: { name } }]
    })
    if (!tag) {
      return message.reply('Tag not found.')
    }

    await tag.edit({ content })

    return message.reply(`Successfully edited tag **${tag.names[0]?.name ?? 'Unknown'}**.`)
  }
}

function _validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = EditTagCommand
