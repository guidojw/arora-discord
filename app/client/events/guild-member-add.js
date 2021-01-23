'use strict'
const BaseEvent = require('./base')

class GuildMemberAddEvent extends BaseEvent {
  handle (member) {
    if (member.user.bot) {
      return
    }

    const guild = this.client.guilds.cache.get(member.guild.id)
    if (guild.welcomeChannel) {
      const embed = new MessageEmbed()
        .setTitle(`Hey ${member.user.tag},`)
        .setDescription(`You're the **${member.guild.memberCount}th** member on **${member.guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(guild.getData('primaryColor'))
      return guild.welcomeChannel.send(embed)
    }
  }
}

module.exports = GuildMemberAddEvent
