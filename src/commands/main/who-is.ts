import { Command, type CommandOptions } from '../base'
import { type CommandInteraction, MessageEmbed } from 'discord.js'
import { ApplyOptions } from '../../utils/decorators'
import type { GuildContext } from '../../structures'
import type { RobloxUser } from '../../types/roblox-user'
import applicationConfig from '../../configs/application'
import { injectable } from 'inversify'
import pluralize from 'pluralize'
import { timeUtil } from '../../utils'
import { userService } from '../../services'

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
  public async execute (interaction: CommandInteraction, { user }: { user: RobloxUser }): Promise<void> {
    const context = interaction.inGuild()
      ? this.client.guildContexts.resolve(interaction.guildId) as GuildContext
      : null

    const userInfo = await userService.getUser(user.id)
    const age = Math.floor((Date.now() - new Date(userInfo.created).getTime()) / 86_400_000)
    const outfits = await userService.getUserOutfits(user.id)

    const embed = new MessageEmbed()
      .setAuthor({ name: userInfo.name ?? 'Unknown', iconURL: `https://www.roblox.com/headshot-thumbnail/image?width=150&height=150&format=png&userId=${user.id}` })
      .setThumbnail(`https://www.roblox.com/outfit-thumbnail/image?width=150&height=150&format=png&userOutfitId=${outfits[0]?.id ?? 0}`)
      .setColor(context?.primaryColor ?? applicationConfig.defaultColor)
      .addField('Blurb', userInfo.description !== '' ? userInfo.description : 'No blurb')
      .addField('Join Date', getDate(new Date(userInfo.created)), true)
      .addField('Account Age', pluralize('day', age, true), true)
      .addField('\u200b', '\u200b', true)
      .setFooter({ text: `User ID: ${user.id}` })
      .setTimestamp()
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (context !== null && context.robloxGroupId !== null) {
      const groupsRoles = await userService.getGroupsRoles(user.id)
      const group = groupsRoles.find(group => group.group.id === context.robloxGroupId)
      embed
        .addField('Role', group?.role.name ?? 'Guest', true)
        .addField('Rank', (group?.role.rank ?? 0).toString(), true)
        .addField('\u200b', '\u200b', true)
    }
    embed.addField('\u200b', `[Profile](https://www.roblox.com/users/${user.id}/profile)`)
    return await interaction.reply({ embeds: [embed] })
  }
}
