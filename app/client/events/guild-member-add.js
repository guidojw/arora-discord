'use strict'
const { MessageEmbed } = require('discord.js')

const guildMemberAddHandler = (client, member) => {
  if (member.user.bot) {
    return
  }

  const guild = client.guilds.cache.get(member.guild.id)
  if (guild.welcomeChannel) {
    const embed = new MessageEmbed()
      .setTitle(`Hey ${member.user.tag},`)
      .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(guild.primaryColor)
    return guild.welcomeChannel.send(embed)
  }
}

module.exports = guildMemberAddHandler
