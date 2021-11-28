import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Message, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import type { Group } from '../../structures'
import applicationConfig from '../../configs/application'
import { discordService } from '../../services'

export default class GroupsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'groups',
      description: 'Lists all role and channel groups.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'group',
        prompt: 'What group would you like to know the information of?',
        type: 'arora-group',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { group }: { group: Group | '' }
  ): Promise<Message | Message[] | null> {
    if (group !== '') {
      const embed = new MessageEmbed()
        .setTitle(`Group ${group.id}`)
        .addField('Name', group.name, true)
        .addField('Type', group.type, true)
        .addField('Guarded', group.guarded ? 'yes' : 'no', true)
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      if (group.isChannelGroup()) {
        const channelsString = Array.from(group.channels.cache.values()).join(' ')
        embed.addField('Channels', channelsString !== '' ? channelsString : 'none')
      } else if (group.isRoleGroup()) {
        const rolesString = Array.from(group.roles.cache.values()).join(' ')
        embed.addField('Roles', rolesString !== '' ? rolesString : 'none')
      }
      return await message.replyEmbed(embed)
    } else {
      if (message.guild.groups.cache.size === 0) {
        return await message.reply('No groups found.')
      }

      const embeds = discordService.getListEmbeds(
        'Groups',
        message.guild.groups.cache.values(),
        getGroupRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
      return null
    }
  }
}

function getGroupRow (group: Group): string {
  return `${group.id}. \`${group.name}\``
}
