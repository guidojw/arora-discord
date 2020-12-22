'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')
const { Tag, TagName } = require('../../models')

class AddTagCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'addtag',
      description: 'Adds a new tag.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        prompt: 'What do you want the name of the tag to be?',
        type: 'string',
        validate: _validateName
      }, {
        key: 'content',
        prompt: 'What do you want the content of the tag to be?',
        type: 'string'
      }]
    })
  }

  async execute (message, { name, content }, guild) {
    if (await Tag.findOne({ include: [{ model: TagName, as: 'names', where: { name } }] })) {
      return message.reply('A tag with that name already exists.')
    }
    try {
      const embed = new MessageEmbed(JSON.parse(content))
      const valid = discordService.validateEmbed(embed)
      if (typeof valid === 'string') {
        return message.reply(valid)
      }

      content = JSON.stringify(embed.toJSON())

    } catch (err) {
      // Once a user fetches a tag, the bot replies to them with the tag content.
      // Tagging a user takes up 23 characters: 21 for tag format (<@snowflake>) + 2 for ", ".
      if (content.length + 23 > 2000) {
        return message.reply('Tag is too long.')
      }
    }

    const tag = await Tag.create({ guildId: guild.id, authorId: message.author.id, content })
    await tag.createName({ name })

    return message.reply(`Successfully added tag **${name}**.`)
  }
}

function _validateName (name) {
  return name.includes(' ') ? 'Name cannot include spaces.' : true
}

module.exports = AddTagCommand
