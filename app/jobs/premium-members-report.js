'use strict'
const { MessageEmbed } = require('discord.js')
const pluralize = require('pluralize')

module.exports = async guild => {
  const members = await guild.guild.members.fetch()
  const premiumMembers = []
  for (const member of members.values()) {
    if (member.premiumSince) {
      premiumMembers.push(member)
    }
  }

  const monthlyPremiumMembers = []
  const now = new Date()
  for (const member of premiumMembers) {
    const premiumDate = member.premiumSince
    if (premiumDate.getMonth() !== now.getMonth() && premiumDate.getDate() === now.getDate()) {
      monthlyPremiumMembers.push({
        member: member,
        months: now.getMonth() - premiumDate.getMonth() + (now.getFullYear() - premiumDate.getFullYear()) * 12
      })
    }
  }
  monthlyPremiumMembers.sort((a, b) => b.months - a.months)

  if (monthlyPremiumMembers.length > 0) {
    const embed = new MessageEmbed()
      .setTitle('Server Booster Report')
      .setColor(0xff73fa)
    const emojis = guild.getData('emojis')
    const emoji = guild.guild.emojis.cache.find(emoji => emoji.id === emojis.boostEmoji)
    for (const { member, months } of monthlyPremiumMembers) {
      if (member.user.partial) await member.user.fetch()
      embed.addField(`${member.user.tag} ${emoji || ''}`, `Has been boosting this server for **${months}` +
        `** ${pluralize('month', months)}!`)
    }

    const channels = guild.getData('premiumMembersReportChannels')
    for (const id of channels) {
      const channel = guild.guild.channels.cache.get(id)
      if (!channel) {
        throw new Error('Cannot get channel.')
      }

      channel.send(embed)
    }
  }
}
