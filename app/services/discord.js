'use strict'
const { MessageEmbed } = require('discord.js')

const applicationConfig = require('../../config/application')

const REACTION_COLLECTOR_TIMEOUT = 60000

exports.getMemberByName = async (guild, name) => {
  const members = await guild.members.fetch()
  for (const member of members.values()) {
    if (member.displayName.toLowerCase() === name.toLowerCase()) {
      return member
    }
  }
}

exports.isAdmin = (member, adminRoles) => {
  for (const roleId of adminRoles) {
    if (member.roles.cache.has(roleId)) {
      return true
    }
  }
  return false
}

exports.getEmojiFromNumber = number => {
  switch (number) {
    case 1:
      return '1⃣'
    case 2:
      return '2⃣'
    case 3:
      return '3⃣'
    case 4:
      return '4⃣'
    case 5:
      return '5⃣'
    case 6:
      return '6⃣'
    case 7:
      return '7⃣'
    case 8:
      return '8⃣'
    case 9:
      return '9⃣'
    case 10:
      return '🔟'
  }
}

exports.prompt = async (channel, author, message, options) => {
  const filter = (reaction, user) => options.includes(reaction.emoji.name) && user.id === author.id
  const collector = message.createReactionCollector(filter, { time: REACTION_COLLECTOR_TIMEOUT })
  const promise = new Promise(resolve => {
    collector.on('end', collected => {
      const reaction = collected.first()
      resolve(reaction ? reaction.emoji.name : null)
    })
  })
  collector.on('collect', collector.stop)
  for (const option of options) {
    await message.react(option)
  }
  return promise
}

exports.getListEmbeds = async (title, values, getRow, data) => {
  const embeds = []
  let embed = new MessageEmbed()
    .setTitle(title)
    .setColor(applicationConfig.primaryColor)

  for (const value of values) {
    const row = await getRow(value, data)
    const currentField = embed.fields.length - 1
    if (currentField === -1) {
      embed.addField('\u200b', `${row}\n`)
    } else {
      const fieldLength = embed.fields.length >= 0 ? embed.fields[currentField].value.length : 0
      const addition = row.length + 2 // +2 for \n

      if (embed.length + addition <= 6000 && fieldLength + addition <= 1024) {
        embed.fields[currentField].value += `${row}\n`
      } else {
        if (embed.length + addition + 6 > 6000) { // +6 for \u200b
          embeds.push(embed)
          embed = new MessageEmbed()
            .setColor(applicationConfig.primaryColor)
        }
        embed.addField('\u200b', `${row}\n`)
      }
    }
  }
  embeds.push(embed)

  return embeds
}
