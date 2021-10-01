import type BaseHandler from '../base'
import type Client from '../client'
import type { GuildMember } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import applicationConfig from '../../configs/application'
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
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (welcomeChannelsGroup !== null && welcomeChannelsGroup.isChannelGroup() &&
      welcomeChannelsGroup.channels.cache.size > 0) {
      const embed = new MessageEmbed()
        .setTitle(`Hey ${member.user.tag},`)
        .setDescription(`You're the **${getOrdinalNum(guild.memberCount)}** member on **${guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(guild.primaryColor ?? applicationConfig.defaultColor)
      await Promise.all(welcomeChannelsGroup.channels.cache.map(async channel => (
        await channel.send({ embeds: [embed] }))
      ))
    }

    const persistentRoles = await member.fetchPersistentRoles()
    if (persistentRoles.size > 0) {
      await member.roles.add(persistentRoles)
    }
  }
}
