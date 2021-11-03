import type {
  BaseGuildCommandInteraction,
  CommandInteraction,
  GuildChannel,
  TextChannel,
  VoiceChannel
} from 'discord.js'
import { Collection, MessageEmbed } from 'discord.js'
import { inject, injectable } from 'inversify'
import { ApplyOptions } from '../../util/decorators'
import { Channel as ChannelEntity } from '../../entities'
import type { GuildContext } from '../../structures'
import type { Repository } from 'typeorm'
import { SubCommandCommand } from '../base'
import type { SubCommandCommandOptions } from '../base'
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
  @inject(TYPES.ChannelRepository)
  private readonly channelRepository!: Repository<ChannelEntity>

  public async link (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { fromChannel, toChannel }: {
      fromChannel: VoiceChannel
      toChannel: TextChannel
    }
  ): Promise<void> {
    await this.linkChannel(fromChannel, toChannel)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await interaction.reply(`Successfully linked voice channel ${fromChannel.toString()} to text channel ${toChannel.toString()}.`)
  }

  public async unlink (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { fromChannel, toChannel }: {
      fromChannel: VoiceChannel
      toChannel: TextChannel
    }
  ): Promise<void> {
    await this.unlinkChannel(fromChannel, toChannel)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await interaction.reply(`Successfully unlinked text channel ${toChannel.toString()} from voice channel ${fromChannel.toString()}.`)
  }

  public async list (
    interaction: CommandInteraction & BaseGuildCommandInteraction<'cached'>,
    { channel }: { channel: VoiceChannel }
  ): Promise<void> {
    const context = this.client.guildContexts.resolve(interaction.guildId) as GuildContext

    const links = await this.fetchToLinks(channel)
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

  private async fetchToLinks (channel: VoiceChannel): Promise<Collection<string, TextChannel>> {
    const data = await this.getData(channel)

    return channel.guild.channels.cache.filter(otherChannel => (
      otherChannel.isText() && data?.toLinks.some(link => link.id === otherChannel.id)) === true
    ) as Collection<string, TextChannel>
  }

  private async linkChannel (voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<void> {
    const data = await this.getData(voiceChannel) ?? await this.channelRepository.save(this.channelRepository.create({
      id: voiceChannel.id,
      guildId: voiceChannel.guild.id
    }))
    if (typeof data.toLinks === 'undefined') {
      data.toLinks = []
    }

    if (data.toLinks.some(link => link.id === textChannel.id)) {
      throw new Error('Voice channel does already have linked text channel.')
    } else {
      data.toLinks.push({ id: textChannel.id, guildId: voiceChannel.guild.id })
      await this.channelRepository.save(data)
    }
  }

  private async unlinkChannel (voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<void> {
    const data = await this.getData(voiceChannel)

    if (typeof data === 'undefined' || !data?.toLinks.some(link => link.id === textChannel.id)) {
      throw new Error('Voice channel does not have linked text channel.')
    } else {
      data.toLinks = data.toLinks.filter(link => link.id !== textChannel.id)
      await this.channelRepository.save(data)
    }
  }

  private async getData (channel: GuildChannel): Promise<(ChannelEntity & { toLinks: ChannelEntity[] }) | undefined> {
    return await this.channelRepository.findOne(
      { id: channel.id, guildId: channel.guild.id },
      { relations: ['toLinks'] }
    ) as (ChannelEntity & { toLinks: ChannelEntity[] }) | undefined
  }
}
