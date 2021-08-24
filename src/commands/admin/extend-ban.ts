import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { argumentUtil } from '../../util'

const { validators, noChannels, noTags, noUrls } = argumentUtil

export default class ExtendBanCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'extendban',
      description: 'Extends the ban of given user.',
      details: 'A ban can be max 7 days long or permanent.',
      aliases: ['extend'],
      examples: ['extend Happywalker 3 He still doesn\'t understand.'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose ban would you like to extend?'
      }, {
        key: 'days',
        type: 'integer',
        prompt: 'With how many days would you like to extend this person\'s ban?',
        min: -6,
        max: 6
      }, {
        key: 'reason',
        type: 'string',
        prompt: 'With what reason are you extending this person\'s ban?',
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

    await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}/extend`, {
      authorId,
      duration: days * 24 * 60 * 60 * 1000,
      reason
    })

    return await message.reply(`Successfully extended **${user.username ?? user.id}**'s ban.`)
  }
}
