'use strict'

const { MessageEmbed } = require('discord.js')
const { getOrdinalNum } = require('../../util').util

const guildMemberAddHandler = async (client, member) => {
  if (member.user.bot) {
    return
  }

  const guild = member.guild
  const welcomeChannelsGroup = guild.groups.resolve('welcomeChannels')
  if (welcomeChannelsGroup?.channels?.cache.size > 0) {
    const embed = new MessageEmbed()
      .setTitle(`Hey ${member.user.tag},`)
      .setDescription(`You're the **${getOrdinalNum(guild.memberCount)}** member on **${guild.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(guild.primaryColor)
    welcomeChannelsGroup.channels.cache.forEach(channel => channel.send(embed))
  }

  const persistentRoles = await member.fetchPersistentRoles()
  if (persistentRoles.size > 0) {
    member.roles.add(persistentRoles)
  }
}

module.exports = guildMemberAddHandler
