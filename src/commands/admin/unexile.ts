import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { argumentUtil } from '../../util'

const { validators, noChannels, noTags, noUrls } = argumentUtil

export default class UnexileCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'unexile',
      description: 'Unexiles given user.',
      examples: ['unexile Happywalker They said they won\'t do it again.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to unexile?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to unexile this person?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { user, reason }: {
      user: RobloxUser
      reason: string
    }
  ): Promise<Message | Message[] | null> {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof authorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('DELETE', `v1/groups/${message.guild.robloxGroupId}/exiles/${user.id}`, {
      authorId,
      reason
    })

    return await message.reply(`Successfully unexiled **${user.username ?? user.id}**.`)
  }
}
