import {
  type BaseCommandInteraction,
  type CommandInteraction,
  MessageEmbed,
  type TextChannel,
  type VoiceChannel
} from 'discord.js'
import { SubCommandCommand, type SubCommandCommandOptions } from '../base'
import { inject, injectable } from 'inversify'
import { ApplyOptions } from '../../util/decorators'
import type { ChannelLinkService } from '../../services'
import type { GuildContext } from '../../structures'
import applicationConfig from '../../configs/application'
import { constants } from '../../util'

const { TYPES } = constants

@injectable()
@ApplyOptions<SubCommandCommandOptions<ChannelLinksCommand>>({
  subCommands: {
    link: {
      args: [{ key: 'fromchannel', name: 'fromChannel' }, { key: 'tochannel', name: 'toChannel' }]
    },
    unlink: {
      args: [{ key: 'fromchannel', name: 'fromChannel' }, { key: 'tochannel', name: 'toChannel' }]
    },
    list: {
      args: [{ key: 'channel' }]
    }
  }
})
export default class ChannelLinksCommand extends SubCommandCommand<ChannelLinksCommand> {
  @inject(TYPES.ChannelLinkService)
  private readonly channelLinkService!: ChannelLinkService

  public async link (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { fromChannel, toChannel }: {
      fromChannel: VoiceChannel
      toChannel: TextChannel
    }
  ): Promise<void> {
    await this.channelLinkService.linkChannel(fromChannel, toChannel)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await interaction.reply(`Successfully linked voice channel ${fromChannel.toString()} to text channel ${toChannel.toString()}.`)
  }

  public async unlink (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { fromChannel, toChannel }: {
      fromChannel: VoiceChannel
      toChannel: TextChannel
    }
  ): Promise<void> {
    await this.channelLinkService.unlinkChannel(fromChannel, toChannel)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await interaction.reply(`Successfully unlinked text channel ${toChannel.toString()} from voice channel ${fromChannel.toString()}.`)
  }

  public async list (
    interaction: CommandInteraction & BaseCommandInteraction<'cached'>,
    { channel }: { channel: VoiceChannel }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    const links = await this.channelLinkService.fetchToLinks(channel)
    if (links.size === 0) {
      return await interaction.reply('No links found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${channel.name}'s Channel Links`)
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      .setDescription(links.map(channel => channel.toString()).toString())
      .setColor(context.primaryColor ?? applicationConfig.defaultColor)
    return await interaction.reply({ embeds: [embed] })
  }
}
