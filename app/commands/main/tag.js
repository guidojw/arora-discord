'use strict'
const Command = require('../../controllers/command')

const { MessageEmbed } = require('discord.js')
const { Tag, TagName } = require('../../models')

module.exports = class TagCommand extends Command {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'tag',
      description: 'Posts given tag.',
      examples: ['tag rr'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'name',
        type: 'string',
        prompt: 'What tag would you like to check out?'
      }]
    })
  }

  async execute (message, { name }, guild) {
    if (name !== 'all') {
      const tag = await Tag.findOne({
        where: { guildId: guild.id },
        include: [{ model: TagName, as: 'names', where: { name } }]
      })
      if (!tag) {
        return message.reply('Tag not found.')
      }

      try {
        const embed = new MessageEmbed(JSON.parse(tag.content))

        return message.reply(embed)
      } catch (err) {
        return message.reply(tag.content)
      }
    } else {
      const tags = await Tag.findAll({ where: { guildId: guild.id } })

      let list = ''
      let count = 1
      for (const tag of tags) {
        for (const tagName of tag.names) {
          list += `${count}. ${tagName.name}\n`
          count++
        }
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter(`Page 1/1 (${count - 1} entries)`)
        .setColor(guild.primaryColor)
      return message.replyEmbed(embed)
    }
  }
}
