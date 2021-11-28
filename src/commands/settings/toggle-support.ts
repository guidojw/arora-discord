import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'

export default class ToggleSupportCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'togglesupport',
      aliases: ['toggle'],
      description: 'Enables/disables the support system.',
      clientPermissions: ['SEND_MESSAGES']
    })
  }

  public async run (message: CommandoMessage): Promise<Message | Message[] | null> {
    await message.guild.update({ supportEnabled: !message.guild.supportEnabled })

    const embed = new MessageEmbed()
      .setColor(message.guild.supportEnabled ? 0x00ff00 : 0xff0000)
      .setTitle('Successfully toggled support')
      .setDescription(`Tickets System: **${message.guild.supportEnabled ? 'online' : 'offline'}**`)
    return await message.replyEmbed(embed)
  }
}
