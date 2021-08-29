import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { ChangeMemberRole } from '../../services/group'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'

export default class PromoteCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'promote',
      description: 'Promotes given user in the group.',
      examples: ['promote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        prompt: 'Who would you like to promote?',
        type: 'roblox-user'
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { user }: { user: RobloxUser }
  ): Promise<Message | Message[] | null> {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof authorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    const roles: ChangeMemberRole = (await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/users/${user.id}/promote`, {
      authorId
    })).data

    return await message.reply(`Successfully promoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}
