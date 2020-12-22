'use strict'
const Command = require('../../controllers/command')

const { Tag, TagName } = require('../../models')

class AddTagAliasCommand extends Command {
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
        key: 'alias',
        prompt: 'What would you like the new alias of this tag to be?',
        type: 'string',
        validate: _validateAlias
      }]
    })
  }

  async execute (message, { tagName, alias }) {
    tagName = tagName.toLowerCase()
    alias = alias.toLowerCase()
    const tag = await Tag.findOne({ include: [{ model: TagName, as: 'names', where: { name: tagName } }] })
    if (!tag) {
      return message.reply('Tag not found.')
    }
    if (await Tag.findOne({ include: [{ model: TagName, as: 'names', where: { name: alias } }] })) {
      return message.reply('A tag with that alias already exists.')
    }

    await tag.createName({ name: alias })

    return message.reply(`Successfully added alias **${alias}** to tag **${tag.names[0]?.name ?? 'Unknown'}**.`)
  }
}

function _validateAlias (alias) {
  return alias.includes(' ') ? 'Alias cannot include spaces.' : true
}

module.exports = AddTagAliasCommand
