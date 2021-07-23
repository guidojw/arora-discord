import type BaseHandler from '../base'
import type Client from '../client'
import type { GuildMember } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import { injectable } from 'inversify'
import { util } from '../../util'

const { getOrdinalNum } = util

@injectable()
export default class GuildMemberAddEventHandler implements BaseHandler {
  public async handle (_client: Client, member: GuildMember): Promise<void> {
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
        .setColor(guild.primaryColor ?? 0xffffff)
      await welcomeChannelsGroup.channels.cache.map(channel => channel.send(embed))
    }

    const persistentRoles = await member.fetchPersistentRoles()
    if (persistentRoles.size > 0) {
      await member.roles.add(persistentRoles)
    }
  }
}
