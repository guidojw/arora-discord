import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { ChangeMemberRole } from '../../services/group'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'

export default class DemoteCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'demote',
      description: 'Demotes given user in the group.',
      examples: ['demote Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        prompt: 'Who would you like to demote?',
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

    const roles: ChangeMemberRole = (await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/users/${user.id}/demote`, {
      authorId
    })).data

    return await message.reply(`Successfully demoted **${user.username ?? user.id}** from **${roles.oldRole.name}** to **${roles.newRole.name}**.`)
  }
}
