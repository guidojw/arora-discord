'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')

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
        list += `${tag.id}. ${makeCommaSeparatedString(Array.from(tag.names.cache.values()))}\n`
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

function makeCommaSeparatedString (arr) {
  if (arr.length === 1) {
    return arr[0]
  }
  const firsts = arr.slice(0, arr.length - 1)
  const last = arr[arr.length - 1]
  return `\`${firsts.map(tagName => tagName.name).join('`, `')}\` & \`${last.name}\``
}

module.exports = TagsCommand
