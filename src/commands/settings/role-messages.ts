import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import BaseCommand from '../base'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { RoleMessage } from '../../structures'
import { discordService } from '../../services'
import lodash from 'lodash'

export default class RoleMessagesCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'settings',
      name: 'rolemessages',
      aliases: ['rolemsgs', 'rolemessage', 'rolemsg'],
      description: 'Lists all role messages.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'roleMessage',
        prompt: 'What role message would you like to know the information of?',
        type: 'integer',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { roleMessage }: { roleMessage: RoleMessage | '' }
  ): Promise<Message | Message[] | null> {
    if (roleMessage !== '') {
      const embed = new MessageEmbed()
        .addField(`Role Message ${roleMessage.id}`, `Message ID: \`${roleMessage.messageId ?? 'unknown'}\`, ${roleMessage.emoji?.toString() ?? 'Unknown'} => ${roleMessage.role?.toString() ?? 'Unknown'}`)
        .setColor(message.guild.primaryColor ?? 0xffffff)
      return await message.replyEmbed(embed)
    } else {
      if (message.guild.roleMessages.cache.size === 0) {
        return await message.reply('No role messages found.')
      }

      const embeds = discordService.getListEmbeds(
        'Role Messages',
        Object.values(lodash.groupBy(message.guild.roleMessages.cache.values(), 'messageId')),
        getGroupedRoleMessageRow
      )
      for (const embed of embeds) {
        await message.replyEmbed(embed)
      }
      return null
    }
  }
}

function getGroupedRoleMessageRow (roleMessages: RoleMessage[]): string {
  let result = `**${roleMessages[0].messageId ?? 'unknown'}**\n`
  for (const roleMessage of roleMessages) {
    result += `${roleMessage.id}. ${roleMessage.emoji?.toString() ?? 'Unknown'} => ${roleMessage.role?.toString() ?? 'Unknown'}\n`
  }
  return result
}
