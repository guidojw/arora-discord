import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import applicationConfig from '../../configs/application'
import { groupService } from '../../services'

export default class MemberCountCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'membercount',
      description: 'Posts the current member count of the group.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [
        {
          key: 'groupId',
          type: 'integer',
          prompt: 'From what group would you like to know the member count?',
          default: (message: CommandoMessage) => message.guild.robloxGroupId ?? undefined
        }
      ]
    })
  }

  public async run (
    message: CommandoMessage,
    { groupId }: { groupId?: number }
  ): Promise<Message | Message[] | null> {
    if (typeof groupId === 'undefined') {
      return await message.reply('Invalid group ID.')
    }
    const group = await groupService.getGroup(groupId)

    const embed = new MessageEmbed()
      .addField(`${group.name}'s member count`, group.memberCount)
      .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
    return await message.replyEmbed(embed)
  }
}
