'use strict'
const pluralize = require('pluralize')

const { MessageEmbed } = require('discord.js')
const { timeHelper } = require('../helpers')

module.exports = async guild => {
  const group = guild.groups.resolve('serverBoosterReportChannels')
  if (group.cache.size === 0) {
    return
  }

  const members = await guild.members.fetch()
  const premiumMembers = []
  for (const member of members.values()) {
    if (member.premiumSince) {
      premiumMembers.push(member)
    }
  }

  const monthlyPremiumMembers = []
  const now = new Date()
  for (const member of premiumMembers) {
    const days = timeHelper.diffDays(member.premiumSince, now)
    if (days !== 0 && days % 30 === 0) {
      monthlyPremiumMembers.push({
        member,
        months: days / 30
      })
    }
  }
  monthlyPremiumMembers.sort((a, b) => b.months - a.months)

  if (monthlyPremiumMembers.length > 0) {
    const embed = new MessageEmbed()
      .setTitle('Server Booster Report')
      .setColor(0xff73fa)
    const emoji = guild.emojis.cache.find(emoji => emoji.name.toLowerCase() === 'boost')

    for (const { member, months } of monthlyPremiumMembers) {
      embed.addField(`${member.user.tag} ${emoji || ''}`, `Has been boosting this server for **${pluralize('month', months, true)}**!`)
    }

    for (const channel of group.channels.cache.values()) {
      channel.send(embed)
    }
  }
}
