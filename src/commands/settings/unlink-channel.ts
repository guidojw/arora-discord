import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Message, TextChannel, VoiceChannel } from 'discord.js'
import BaseCommand from '../base'

export default class UnlinkChannelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'unlinkchannel',
      aliases: ['unlinkc'],
      description: 'Unlinks a text channel from a voice channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'fromChannel',
        prompt: 'What voice channel would you like to unlink?',
        type: 'voice-channel'
      }, {
        key: 'toChannel',
        prompt: 'What text channel would you like to unlink from this voice channel?',
        type: 'text-channel'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { fromChannel, toChannel }: {
      fromChannel: VoiceChannel
      toChannel: TextChannel
    }
  ): Promise<Message | Message[] | null> {
    await fromChannel.unlinkChannel(toChannel)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await message.reply(`Successfully unlinked text channel ${toChannel.toString()} from voice channel ${fromChannel.toString()}.`)
  }
}
