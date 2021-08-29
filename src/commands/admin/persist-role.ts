import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { GuildMember, Message, Role } from 'discord.js'
import BaseCommand from '../base'

export default class PersistRoleCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'persistrole',
      aliases: ['persist'],
      description: 'Persists a role on given member.',
      clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
      args: [{
        key: 'member',
        type: 'member',
        prompt: 'Who would you like to give a persistent role?'
      }, {
        key: 'role',
        type: 'role',
        prompt: 'What role would you like to persist on this person?'
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
    await member.persistRole(role)

    return await message.reply(`Successfully persisted role **${role.toString()}** on member **${member.toString()}**.`, {
      allowedMentions: { users: [message.author.id] }
    })
  }
}
