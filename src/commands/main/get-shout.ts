import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, Message } from 'discord.js'
import BaseCommand from '../base'
import type { GetGroupStatus } from '../../services/group'
import { MessageEmbed } from 'discord.js'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'

export default class GetShoutCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'getshout',
      description: 'Gets the current group shout.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true
    })
  }

  public async run (
    message: CommandoMessage & { guild: Guild & { robloxGroupId: number } }
  ): Promise<Message | Message[] | null> {
    const shout: GetGroupStatus | '' = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/status`)).data

    if (shout !== '' && shout.body !== '') {
      const embed = new MessageEmbed()
        .addField(`Current shout by ${shout.poster.username}`, shout.body)
        .setTimestamp(new Date(shout.updated))
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      return await message.replyEmbed(embed)
    } else {
      return await message.reply('There currently is no shout.')
    }
  }
}
