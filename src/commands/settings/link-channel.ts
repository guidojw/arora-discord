import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Message, TextChannel, VoiceChannel } from 'discord.js'
import BaseCommand from '../base'

export default class LinkChannelCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'linkchannel',
      aliases: ['linkc'],
      description: 'Links a voice channel to a text channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'fromChannel',
        prompt: 'What voice channel would you like to link?',
        type: 'voice-channel'
      }, {
        key: 'toChannel',
        prompt: 'What text channel would you like to link to this voice channel?',
        type: 'text-channel'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { fromChannel, toChannel }: { fromChannel: VoiceChannel, toChannel: TextChannel }
  ): Promise<Message | Message[] | null> {
    await fromChannel.linkChannel(toChannel)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return await message.reply(`Successfully linked voice channel ${fromChannel.toString()} to text channel ${toChannel.toString()}.`)
  }
}
