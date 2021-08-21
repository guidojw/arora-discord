import type { Guild, GuildMember } from 'discord.js'
import type BaseJob from './base'
import { MessageEmbed } from 'discord.js'
import { injectable } from 'inversify'
import pluralize from 'pluralize'
import { timeUtil } from '../util'

const { diffDays } = timeUtil

interface PremiumGuildMember extends GuildMember {
  premiumSince: Date
}

@injectable()
export default class PremiumMembersReportJob implements BaseJob {
  public async run (guild: Guild): Promise<void> {
    const serverBoosterReportChannelsGroup = guild.groups.resolve('serverBoosterReportChannels')
    if (serverBoosterReportChannelsGroup === null || !serverBoosterReportChannelsGroup.isChannelGroup() ||
        serverBoosterReportChannelsGroup.channels.cache.size === 0) {
      return
    }

    const members = await guild.members.fetch()
    const premiumMembers: PremiumGuildMember[] = []
    for (const member of members.values()) {
      if (member.premiumSince !== null) {
        premiumMembers.push(member as PremiumGuildMember)
      }
    }

    const monthlyPremiumMembers = []
    const now = new Date()
    for (const member of premiumMembers) {
      const days = diffDays(member.premiumSince, now)
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
        embed.addField(`${member.user.tag} ${emoji?.toString() ?? ''}`, `Has been boosting this server for **${pluralize('month', months, true)}**!`)
      }

      await Promise.all(serverBoosterReportChannelsGroup.channels.cache.map(async channel => await channel.send(embed)))
    }
  }
}
