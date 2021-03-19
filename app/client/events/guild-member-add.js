'use strict'
const { MessageEmbed } = require('discord.js')

const guildMemberAddHandler = async (client, member) => {
  if (member.user.bot) {
    return
  }

  const guild = client.guilds.cache.get(member.guild.id)
  const group = guild.groups.resolve('welcomeChannels')
  if (group.channels.cache.size > 0) {
    const embed = new MessageEmbed()
      .setTitle(`Hey ${member.user.tag},`)
      .setDescription(`You're the **${getOrdinalNum(member.guild.memberCount)}** member on **${member.guild.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(guild.primaryColor)
    await Promise.all(group.channels.cache.map(channel => channel.send(embed)))
  }

  const persistentRoles = await member.fetchPersistentRoles()
  return member.roles.add(persistentRoles)
}

function getOrdinalNum (number) {
  let selector

  if (number < 0) {
    selector = 4
  } else if ((number > 3 && number < 21) || number % 10 > 3) {
    selector = 0
  } else {
    selector = number % 10
  }

  return number + ['th', 'st', 'nd', 'rd', ''][selector]
}

module.exports = guildMemberAddHandler
