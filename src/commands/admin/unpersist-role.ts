import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { GuildMember, Message, Role } from 'discord.js'
import BaseCommand from '../base'

export default class UnpersistRoleCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'unpersistrole',
      aliases: ['unpersist'],
      description: 'Removes a persistent role from given member.',
      clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
      args: [{
        key: 'member',
        type: 'member',
        prompt: 'From who would you like to remove a persistent role?'
      }, {
        key: 'role',
        type: 'role',
        prompt: 'What role would you like to remove?'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { member, role }: {
      member: GuildMember
      role: Role
    }
  ): Promise<Message | Message[] | null> {
    await member.unpersistRole(role)

    return await message.reply(`Successfully removed persistent role **${role.toString()}** from member **${member.toString()}**.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}
