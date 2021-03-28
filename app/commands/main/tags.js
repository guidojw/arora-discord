'use strict'

const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { makeCommaSeparatedString } = require('../../util').util

class TagsCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'tags',
      aliases: ['tag'],
      description: 'Posts given tag.',
      examples: ['tag rr'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'tag',
        type: 'tag',
        prompt: 'What tag would you like to check out?',
        default: ''
      }]
    })
  }

  run (message, { tag }) {
    if (tag) {
      return message.reply(tag.content, tag.content instanceof MessageEmbed
        ? undefined
        : { allowedMentions: { users: [message.author.id] } })
    } else {
      let list = ''
      for (const tag of message.guild.tags.cache.values()) {
        list += `${tag.id}. ${makeCommaSeparatedString(tag.names.cache.map(tagName => `\`${tagName.name}\``))}\n`
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter(`Page 1/1 (${message.guild.tags.cache.size} entries)`)
        .setColor(message.guild.primaryColor)
      return message.replyEmbed(embed)
    }
  }
}
module.exports = TagsCommand
