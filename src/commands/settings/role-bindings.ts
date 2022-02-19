import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Message, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import type { RoleBinding } from '../../structures'
import applicationConfig from '../../configs/application'
import { discordService } from '../../services'
import lodash from 'lodash'

export default class RoleBindingsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'rolebindings',
      aliases: ['rolebnds', 'rolebinding', 'rolebnd'],
      description: 'Lists all Roblox rank to Discord role bindings.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleBinding',
        prompt: 'What role binding would you like to know the information of?',
        type: 'role-binding',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { roleBinding }: { roleBinding: RoleBinding | '' }
  ): Promise<Message | Message[] | null> {
    if (roleBinding !== '') {
      const embed = new MessageEmbed()
        .addField(`Role Binding ${roleBinding.id}`, `\`${roleBinding.robloxGroupId}\` \`${getRangeString(roleBinding.min, roleBinding.max)}\` => ${roleBinding.role?.toString() ?? 'Unknown'}`)
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      return await message.replyEmbed(embed)
    } else {
      await message.guild.roleBindings.fetch()
      if (message.guild.roleBindings.cache.size === 0) {
        return await message.reply('No role bindings found.')
      }

      const embeds = discordService.getListEmbeds(
        'Role Bindings',
        Object.values(lodash.groupBy(Array.from(message.guild.roleBindings.cache.values()), 'roleId')),
        getGroupedRoleBindingRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
      return null
    }
  }
}

function getGroupedRoleBindingRow (roleBindings: RoleBinding[]): string {
  let result = `${roleBindings[0].role?.toString() ?? 'Unknown'}\n`
  for (const roleBinding of roleBindings) {
    result += `${roleBinding.id}. \`${roleBinding.robloxGroupId}\` \`${getRangeString(roleBinding.min, roleBinding.max)}\`\n`
  }
  return result
}

function getRangeString (min: number, max: number | null): string {
  return `${max !== null ? '[' : ''}${min}${max !== null ? `, ${max}]` : ''}`
}
