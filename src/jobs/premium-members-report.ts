import { EmbedBuilder, type GuildMember } from 'discord.js'
import type { BaseJob } from '.'
import type { GuildContext } from '../structures'
import { injectable } from 'inversify'
import pluralize from 'pluralize'
import { timeUtil } from '../utils'

interface PremiumGuildMember extends GuildMember {
  premiumSince: Date
}

const { diffDays } = timeUtil

@injectable()
export default class PremiumMembersReportJob implements BaseJob {
  public async run (context: GuildContext): Promise<void> {
    const serverBoosterReportChannelsGroup = context.groups.resolve('serverBoosterReportChannels')
    if (
      serverBoosterReportChannelsGroup === null || !serverBoosterReportChannelsGroup.isChannelGroup() ||
        serverBoosterReportChannelsGroup.channels.cache.size === 0
    ) {
      return
    }

    const members = await context.guild.members.fetch()
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
      const embed = new EmbedBuilder()
        .setTitle('Server Booster Report')
        .setColor(0xff73fa)
      const emoji = context.guild.emojis.cache.find(emoji => emoji.name?.toLowerCase() === 'boost')

      for (const { member, months } of monthlyPremiumMembers) {
        embed.addFields([
          {
            name: `${member.user.tag} ${emoji?.toString() ?? ''}`,
            value: `Has been boosting this server for **${pluralize('month', months, true)}**!`
          }
        ])
      }

      await Promise.all(serverBoosterReportChannelsGroup.channels.cache.map(async channel => (
        await channel.send({ embeds: [embed] }))
      ))
    }
  }
}
