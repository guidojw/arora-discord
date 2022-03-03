import { type CommandInteraction, type GuildMember, MessageEmbed } from 'discord.js'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import { injectable } from 'inversify'
import pluralize from 'pluralize'
import { timeUtil } from '../../../../utils'

const { diffDays } = timeUtil

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'member',
        required: false,
        default: (interaction: CommandInteraction) => interaction.member
      }
    ]
  }
})
export default class BoostInfoCommand extends Command {
  public async execute (interaction: CommandInteraction, { member }: { member: GuildMember }): Promise<void> {
    if (member.premiumSince === null) {
      return await interaction.reply('Member is not a booster.')
    }

    const now = new Date()
    const diff = diffDays(member.premiumSince, now)
    const months = Math.floor(diff / 30)
    const days = diff % 30
    const emoji = this.client.mainGuild?.emojis.cache.find(emoji => emoji.name?.toLowerCase() === 'boost')

    if (member.user.partial) {
      await member.user.fetch()
    }
    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag} ${emoji?.toString() ?? ''}`)
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`Has been boosting this server for **${pluralize('month', months, true)}** and **${pluralize('day', days, true)}**!`)
      .setFooter({ text: '* Discord Nitro months are 30 days long.' })
      .setColor(0xff73fa)
    return await interaction.reply({ embeds: [embed] })
  }
}
