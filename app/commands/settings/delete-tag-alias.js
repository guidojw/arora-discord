'use strict'
const Command = require('../../controllers/command')

const { Tag, TagName } = require('../../models')

class DeleteTagAliasCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'deletetagalias',
      aliases: ['deltagalias', 'deletealias', 'delalias'],
      description: 'Deletes a tag alias.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'alias',
        prompt: 'What tag alias would you like to delete?',
        type: 'string',
        validate: _validateAlias
      }]
    })
  }

  async execute (message, { alias }, guild) {
    alias = alias.toLowerCase()
    let tagName
    const tag = await Tag.findOne({
      where: { guildId: guild.id },
      include: [{ model: TagName, as: 'names', where: { name: alias } }]
    })
    if (tag) {
      tagName = tag.names.find(tagName => tagName.name === alias)
    }
    if (!tagName) {
      return message.reply('Tag alias not found.')
    }

    await tagName.destroy()

    return message.reply(`Successfully deleted tag alias **${tag.names[0]?.name ?? 'Unknown'}**.`)
  }
}

function _validateAlias (alias) {
  return alias.includes(' ') ? 'Alias cannot include spaces.' : true
}

module.exports = DeleteTagAliasCommand