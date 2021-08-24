import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import { MessageEmbed } from 'discord.js'

export default class PersistentRolesCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'persistentroles',
      description: 'Fetches given member\'s persistent roles.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'member',
        type: 'member',
        prompt: 'Of who would you like to know the persistent roles?',
        default: (message: CommandoMessage) => message.member
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { member }: { member: GuildMember }
  ): Promise<Message | Message[] | null> {
    const persistentRoles = await member.fetchPersistentRoles()
    if (persistentRoles.size === 0) {
      return await message.reply('No persistent roles found.')
    }

    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag}'s Persistent Roles`)
      .setDescription(persistentRoles.map(role => role.toString()))
      .setColor(message.guild.primaryColor ?? 0xffffff)
    return await message.replyEmbed(embed)
  }
}
