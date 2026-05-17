import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js'
import { inject, injectable, named } from 'inversify'
import { ApplyOptions } from '../../../../utils/decorators'
import { Command } from '../base'
import type { CommandOptions } from '..'
import type { GuildContext } from '../../../../structures'
import { GuildContextManager } from '../../../../managers'
import { WebSocketManager } from '../../../../client'
import applicationConfig from '../../../../configs/application'
import { constants } from '../../../../utils'
import { oAuthService } from '../../../../services'

const { TYPES } = constants
const { robloxOAuthId } = oAuthService

interface RobloxUserVerifyPacket {
  id: string
}

@injectable()
@ApplyOptions<CommandOptions>({
  requiresApi: true
})
export default class VerifyCommand extends Command {
  @inject(TYPES.Manager)
  @named('GuildContextManager')
  private readonly guildContexts!: GuildContextManager

  @inject(TYPES.WebSocketManager)
  private readonly aroraWs!: WebSocketManager

  public async execute (interaction: ChatInputCommandInteraction<'raw' | 'cached'>): Promise<void> {
    const context = this.guildContexts.resolve(interaction.guildId) as GuildContext

    const authorizationUrl = await oAuthService.getAuthorizationUrl(interaction.user.id)

    const embed = new EmbedBuilder()
      .addFields([{ name: 'Verify your Discord user with Roblox', value: 'Click the link below' }])
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Roblox')
          .setURL(authorizationUrl)
          .setStyle(ButtonStyle.Link)
      )
    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    })

    try {
      await new Promise<void>((resolve, reject) => {
        const handler = (data: { data: RobloxUserVerifyPacket }): void => {
          if (data.data.id === robloxOAuthId(interaction.user.id)) {
            this.aroraWs.removeListener.bind(this.aroraWs, 'robloxUserVerify', handler)
            resolve()
          }
        }
        this.aroraWs.on('robloxUserVerify', handler)
        setTimeout(() => {
          this.aroraWs.removeListener.bind(this.aroraWs, 'robloxUserVerify', handler)
          reject(new Error())
        }, 14 * 60 * 1000)
      })

      const userInfo = await oAuthService.fetchUserInfo(interaction.user.id)

      const embed = new EmbedBuilder()
        .addFields([{ name: 'Successfully verified with Roblox as', value: userInfo.name }])
        .setThumbnail(userInfo.picture)
        .setFooter({ text: `Username: ${userInfo.preferred_username} | User ID: ${userInfo.sub}` })
        .setColor(0x00ff00)
      await interaction.editReply({
        embeds: [embed],
        components: []
      })
    } catch (err) {
      const embed = new EmbedBuilder()
        .addFields([{ name: 'Verification with Roblox failed', value: 'Try again with `/verify`' }])
        .setColor(0xff0000)
      await interaction.editReply({
        embeds: [embed],
        components: []
      })
    }
  }
}
