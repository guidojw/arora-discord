import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { argumentUtil } from '../../util'
import { userService } from '../../services'

const { validators, noChannels, noTags, noUrls } = argumentUtil

export default class EditBanCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'editban',
      description: 'Edits given user\'s ban\'s key to given data.',
      details: 'Key must be author or reason.',
      examples: ['editban Happywalker author builderman'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Whose ban would you like to edit?'
      }, {
        key: 'key',
        type: 'string',
        prompt: 'What key would you like to edit?',
        oneOf: ['author', 'reason'],
        parse: (val: string) => val.toLowerCase()
      }, {
        key: 'data',
        type: 'string',
        prompt: 'What would you like to edit this key\'s data to?',
        validate: validators([noChannels, noTags, noUrls]) // for when key = 'reason'
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { user, key, data }: {
      user: RobloxUser
      key: string
      data: string
    }
  ): Promise<Message | Message[] | null> {
    const changes: { authorId?: number, reason?: string } = {}
    if (key === 'author') {
      changes.authorId = await userService.getIdFromUsername(data)
    } else if (key === 'reason') {
      changes.reason = data
    }
    const editorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof editorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    await applicationAdapter('PUT', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}`, { changes, editorId })

    return await message.reply(`Successfully edited **${user.username ?? user.id}**'s ban.`)
  }
}
