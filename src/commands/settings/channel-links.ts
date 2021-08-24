import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Message, VoiceChannel } from 'discord.js'
import BaseCommand from '../base'
import { MessageEmbed } from 'discord.js'

export default class ChannelLinksCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'channellinks',
      description: 'Fetches given voice channel\'s linked text channels.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'channel',
        type: 'voice-channel',
        prompt: 'Of what voice channel would you like to know the linked text channels?'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { channel }: { channel: VoiceChannel }
  ): Promise<Message | Message[] | null> {
    const links = await channel.fetchToLinks()
    if (links.size === 0) {
      return await message.reply('No links found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${channel.name}'s Channel Links`)
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      .setDescription(links.map(channel => channel.toString()))
      .setColor(message.guild.primaryColor ?? 0xffffff)
    return await message.replyEmbed(embed)
  }
}
