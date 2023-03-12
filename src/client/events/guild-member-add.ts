import { type GuildMember, MessageEmbed } from 'discord.js'
import { constants, util } from '../../utils'
import { inject, injectable, named } from 'inversify'
import type { BaseHandler } from '..'
import type { GuildContext } from '../../structures'
import { GuildContextManager } from '../../managers'
import { PersistentRoleService } from '../../services'
import applicationConfig from '../../configs/application'

const { TYPES } = constants
const { getOrdinalNum } = util

@injectable()
export default class GuildMemberAddEventHandler implements BaseHandler {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  @inject(TYPES.PersistentRoleService)
  private readonly persistentRoleService!: PersistentRoleService

  public async handle (member: GuildMember): Promise<void> {
    if (member.user.bot) {
      return
    }
    const context = this.guildContexts.resolve(member.guild) as GuildContext

    const guild = member.guild
    const welcomeChannelsGroup = context.groups.resolve('welcomeChannels')
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (welcomeChannelsGroup !== null && welcomeChannelsGroup.isChannelGroup() &&
      welcomeChannelsGroup.channels.cache.size > 0) {
      const embed = new MessageEmbed()
        .setTitle(`Hey ${member.user.tag},`)
        .setDescription(`You're the **${getOrdinalNum(guild.memberCount)}** member on **${guild.name}**!`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(context.primaryColor ?? applicationConfig.defaultColor)
      await Promise.all(welcomeChannelsGroup.channels.cache.map(async channel => (
        await channel.send({ embeds: [embed] }))
      ))
    }

    const persistentRoles = await this.persistentRoleService.fetchPersistentRoles(member)
    if (persistentRoles.size > 0) {
      await member.roles.add(persistentRoles)
    }
  }
}
