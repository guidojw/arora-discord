'use strict'
const BaseCommand = require('../base')

const { Tag, TagName } = require('../../models')

class RawTagCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'rawtag',
      description: 'Posts the raw content of a tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        type: 'string',
        prompt: 'What tag would you like the raw content of?'
      }]
    })
  }

  async run (message, { name }) {
    const tag = await Tag.findOne({
      where: { guildId: message.guild.id },
      include: [{ model: TagName, as: 'names', where: { name } }]
    })
    if (!tag) {
      return message.reply('Tag not found.')
    }

    return message.reply(tag.content, { allowedMentions: { users: [message.author.id] } })
  }
}

module.exports = RawTagCommand
