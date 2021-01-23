'use strict'
const BaseEvent = require('./base')

const { Tag, TagName } = require('../../models')

class MessageEvent extends BaseEvent {
  async handle (message) {
    if (message.author.bot) {
      return
    }
    if (!message.guild) {
      return
    }
    const guild = this.client.guilds.cache.get(message.guild.id)
    const prefix = guild.commandPrefix ?? this.commandPrefix

    const tagCommand = this.client.registry.commands.find(command => command.name === 'tag')
    if (tagCommand.isEnabledIn(message.guild) && message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/)
      const tagName = args.shift().toLowerCase()
      if (tagName) {
        const tag = await Tag.findOne({
          where: { guildId: guild.id },
          include: [{ model: TagName, as: 'names', where: { name: tagName } }]
        })

        if (tag) {
          try {
            const embed = new MessageEmbed(JSON.parse(tag.content))

            return message.reply(embed)
          } catch (err) {
            return message.reply(tag.content)
          }
        }
      }
    }
  }
}

module.exports = MessageEvent
