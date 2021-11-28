import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type GuildMember, type Message, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import pluralize from 'pluralize'
import { timeUtil } from '../../util'

const { diffDays } = timeUtil

export default class BoostInfoCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'boostinfo',
      description: 'Posts the boost information of given member.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'member',
        prompt: 'Whose boost info do you want to know?',
        type: 'member',
        default: (message: CommandoMessage) => message.member
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { member }: { member: GuildMember }
  ): Promise<Message | Message[] | null> {
    if (member.premiumSince === null) {
      return await message.reply(`${message.argString !== '' ? 'Member is not' : 'You\'re not'} a booster.`)
    }
    const now = new Date()
    const diff = diffDays(member.premiumSince, now)
    const months = Math.floor(diff / 30)
    const days = diff % 30
    const emoji = this.client.mainGuild?.emojis.cache.find(emoji => emoji.name.toLowerCase() === 'boost')

    if (member.user.partial) {
      await member.user.fetch()
    }
    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag} ${emoji?.toString() ?? ''}`)
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`Has been boosting this server for **${pluralize('month', months, true)}** and **${pluralize('day', days, true)}**!`)
      .setFooter('* Discord Nitro months are 30 days long.')
      .setColor(0xff73fa)
    return await message.replyEmbed(embed)
  }
}
