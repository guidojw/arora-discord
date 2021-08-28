import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { argumentUtil } from '../../util'

const { validators, noChannels, noTags, noUrls } = argumentUtil

export default class ExileCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'exile',
      description: 'Exiles given user.',
      examples: ['exile Happywalker Spamming the group wall.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to exile?'
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to exile this person?',
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

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/exiles`, {
      userId: user.id,
      authorId,
      reason
    })

    return await message.reply(`Successfully exiled **${user.username ?? user.id}**.`)
  }
}
