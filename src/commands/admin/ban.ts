import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { argumentUtil } from '../../util'

const {
  validators,
  noChannels,
  noTags,
  noUrls,
  parseNoneOrType,
  validateNoneOrType
} = argumentUtil

export default class BanCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'ban',
      description: 'Bans given user.',
      details: 'A ban can be max 7 days long or permanent.',
      examples: ['ban Happywalker Doing stuff.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Who would you like to ban?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'For how long would you like this ban this person? Reply with "none" if you want this ban to be ' +
          'permanent.',
        min: 1,
        max: 7,
        validate: validateNoneOrType,
        parse: parseNoneOrType
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason would you like to ban this person?',
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { user, days, reason }: {
      user: RobloxUser
      days: number
      reason: string
    }
  ): Promise<Message | Message[] | null> {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof authorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans`, {
      userId: user.id,
      authorId,
      duration: typeof days === 'undefined' ? undefined : days * 24 * 60 * 60 * 1000,
      reason
    })

    return await message.reply(`Successfully banned **${user.username ?? user.id}**.`)
  }
}
