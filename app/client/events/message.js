'use strict'
const { MessageEmbed } = require('discord.js')
const { Tag, TagName } = require('../../models')

const messageHandler = async (client, message) => {
  if (message.author.bot) {
    return
  }
  if (!message.guild) {
    return
  }
  const guild = client.guilds.cache.get(message.guild.id)

  const tagCommand = client.registry.commands.find(command => command.name === 'tag')
  if (tagCommand.isEnabledIn(message.guild) && tagCommand.group.isEnabledIn(message.guild) &&
    message.content.startsWith(guild.commandPrefix)) {
    const args = message.content.slice(guild.commandPrefix.length).trim().split(/ +/)
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

module.exports = messageHandler
