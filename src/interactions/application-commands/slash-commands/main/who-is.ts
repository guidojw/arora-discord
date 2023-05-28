import { type ChatInputCommandInteraction, EmbedBuilder, MessageActionRow, MessageButton } from 'discord.js'
import { constants, timeUtil } from '../../../../utils'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import type { RobloxUser } from '../../../../argument-types'
import applicationConfig from '../../../../configs/application'
import pluralize from 'pluralize'
import { userService } from '../../../../services'

const { TYPES } = constants
const { getDate } = timeUtil

@injectable()
@ApplyOptions<CommandOptions>({
  command: {
    args: [
      {
        key: 'username',
        name: 'user',
        type: 'roblox-user',
        required: false,
        default: 'self'
      }
    ]
  }
})
export default class WhoIsCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  public async execute (interaction: ChatInputCommandInteraction, { user }: { user: RobloxUser }): Promise<void> {
    const context = interaction.inGuild()
      ? this.guildContexts.resolve(interaction.guildId) as GuildContext
      : null

    const userInfo = await userService.getUser(user.id)
    const age = Math.floor((Date.now() - new Date(userInfo.created).getTime()) / 86_400_000)
    const outfits = await userService.getUserOutfits(user.id)

    const embed = new EmbedBuilder()
      .setAuthor({
        name: userInfo.name ?? 'Unknown',
        iconURL: `https://www.roblox.com/headshot-thumbnail/image?width=150&height=150&format=png&userId=${user.id}`
      })
      .setThumbnail(`https://www.roblox.com/outfit-thumbnail/image?width=150&height=150&format=png&userOutfitId=${outfits[0]?.id ?? 0}`)
      .setColor(context?.primaryColor ?? applicationConfig.defaultColor)
      .addFields([
        { name: 'Blurb', value: userInfo.description !== '' ? userInfo.description : 'No blurb' },
        { name: 'Join Date', value: getDate(new Date(userInfo.created)), inline: true },
        { name: 'Account Age', value: pluralize('day', age, true), inline: true },
        { name: '\u200b', value: '\u200b', inline: true }
      ])
      .setFooter({ text: `User ID: ${user.id}` })
      .setTimestamp()
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (context !== null && context.robloxGroupId !== null) {
      const groupsRoles = await userService.getGroupsRoles(user.id)
      const group = groupsRoles.find(group => group.group.id === context.robloxGroupId)
      embed
        .addFields([
          { name: 'Role', value: group?.role.name ?? 'Guest', inline: true },
          { name: 'Rank', value: (group?.role.rank ?? 0).toString(), inline: true },
          { name: '\u200b', value: '\u200b', inline: true }
        ])
    }
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Profile')
          .setURL(`https://www.roblox.com/users/${user.id}/profile`)
          .setStyle('LINK')
      )
    await interaction.reply({ embeds: [embed], components: [row] })
  }
}
