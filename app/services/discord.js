'use strict'
const { MessageEmbed } = require('discord.js')

const REACTION_COLLECTOR_TIME = 60000

exports.getMemberByName = async (guild, name) => {
  const members = await guild.members.fetch()
  for (const member of members.values()) {
    if (member.displayName.toLowerCase() === name.toLowerCase()) {
      return member
    }
  }
}

exports.hasSomeRole = (member, roles) => {
  for (const roleId of roles) {
    if (member.roles.cache.has(roleId)) {
      return true
    }
  }
  return false
}

exports.convertRoles = (roles, roleGroups) => {
  roles = [...new Set(roles)]
  for (const [name, groupRoles] of Object.entries(roleGroups)) {
    if (roles.includes(name)) {
      roles.splice(roles.indexOf(name), 1)
      roles.push(...groupRoles)
    }
  }
  return roles
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
  const collector = message.createReactionCollector(filter, { time: REACTION_COLLECTOR_TIME })
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

exports.getListEmbeds = (title, values, getRow, data) => {
  if (values instanceof Object) {
    values = Object.entries(values)
  }

  const embeds = []
  let embed = new MessageEmbed()
    .setTitle(title)

  for (const value of values) {
    const row = getRow(value, data)
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
        }
        embed.addField('\u200b', `${row}\n`)
      }
    }
  }
  embeds.push(embed)

  return embeds
}

exports.validateEmbed = embed => {
  if (embed.length > 6000) {
    return 'Embed length is too big.'
  } else if (embed.title?.length > 256) {
    return 'Title is too long.'
  } else if (embed.description?.length > 2048) {
    return 'Description is too long.'
  } else if (embed.footer?.text.length > 2048) {
    return 'Footer text is too long.'
  } else if (embed.author?.name?.length > 256) {
    return 'Author name is too long.'
  } else if (embed.fields.length > 25) {
    return 'Embed has too many fields.'
  } else {
    for (const field of embed.fields) {
      if (field.name.length > 256) {
        return `Field **${field.name}**'s name is too long.`
      } else if (field.value > 2048) {
        return `Field **${field.name}**'s value is too long.`
      }
    }
  }
  return true
}
