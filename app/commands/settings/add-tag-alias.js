'use strict'
const BaseCommand = require('../base')

const { Tag, TagName } = require('../../models')

class AddTagAliasCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtagalias',
      aliases: ['addalias'],
      description: 'Adds a new alias to a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tagName',
        prompt: 'To what tag would you like to add this alias?',
        type: 'string'
      }, {
        key: 'name',
        prompt: 'What would you like the new alias of this tag to be?',
        type: 'string',
        validate: _validateName
      }]
    })
  }

  async execute (message, { tagName, name }, guild) {
    tagName = tagName.toLowerCase()
    name = name.toLowerCase()
    if (this.client.registry.commands.some(command => command.name === name || command.aliases?.includes(name))) {
      return message.reply('Not allowed, name is reserved.')
    }
    const tag = await Tag.findOne({
      where: { guildId: guild.id },
      include: [{ model: TagName, as: 'names', where: { name: tagName } }]
    })
    if (!tag) {
      return message.reply('Tag not found.')
    }
    if (await Tag.findOne({
      where: { guildId: guild.id },
      include: [{ model: TagName, as: 'names', where: { name } }]
    })) {
      return message.reply('A tag with that alias already exists.')
    }

    await tag.createName({ name })

    return message.reply(`Successfully added alias **${name}** to tag **${tag.names[0]?.name ?? 'Unknown'}**.`)
  }
}

function _validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = AddTagAliasCommand
