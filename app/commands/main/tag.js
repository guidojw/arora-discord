'use strict'
const Command = require('../../controllers/command')
const discordService = require('../../services/discord')

const { MessageEmbed } = require('discord.js')

const tags = require('../../content/tags')

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
      const tag = tags.find(tag => tag.names.includes(name))

      if (!tag) {
        return message.reply('Couldn\'t find tag!')
      }
      if (tag.group === 'admin') {
        if (!discordService.hasSomeRole(message.member, guild.getData('adminRoles'))) {
          return message.reply('You do not have permission to see that tag.')
        } else {
          const channels = guild.getData('channels')
          if (message.channel.id !== channels.hrChannel && message.channel.id !== channels.botCommandsHrChannel) {
            return message.reply('Wrong channel.')
          }
        }
      }

      if (tag.tag instanceof MessageEmbed) {
        const embed = new MessageEmbed(tag.tag)
        embed.setColor(guild.getData('primaryColor'))
        message.reply(embed)
      } else {
        message.reply(tag.tag)
      }
    } else {
      let list = ''
      let count = 1
      for (const tag of tags) {
        for (const name of tag.names) {
          list += `${count}. ${name}\n`
          count++
        }
      }

      const embed = new MessageEmbed()
        .setTitle('Tags')
        .setDescription(list)
        .setFooter(`Page 1/1 (${count - 1} entries)`)
        .setColor(guild.getData('primaryColor'))
      message.replyEmbed(embed)
    }
  }
}
