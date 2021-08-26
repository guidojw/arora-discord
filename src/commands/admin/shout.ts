import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, GuildMember, Message } from 'discord.js'
import BaseCommand from '../base'
import { MessageEmbed } from 'discord.js'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import { argumentUtil } from '../../util'

const { validators, noChannels, noTags, noUrls } = argumentUtil

export default class ShoutCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'shout',
      details: 'Shout can be either a message or "clear". When it\'s clear, the group shout will be cleared.',
      description: 'Posts shout with given shout to the group.',
      examples: ['shout Happywalker is awesome', 'shout "Happywalker is awesome"', 'shout clear'],
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'body',
        type: 'string',
        prompt: 'What would you like to shout?',
        max: 255,
        validate: validators([noChannels, noTags, noUrls])
      }]
    })
  }

  public async run (
    message: CommandoMessage & { member: GuildMember, guild: Guild & { robloxGroupId: number } },
    { body }: { body: string }
  ): Promise<Message | Message[] | null> {
    const authorId = message.member.robloxId ?? (await message.member.fetchVerificationData())?.robloxId
    if (typeof authorId === 'undefined') {
      return await message.reply('This command requires you to be verified with a verification provider.')
    }

    const shout = (await applicationAdapter('POST', `v1/groups/${message.guild.robloxGroupId}/shout`, {
      authorId,
      message: body === 'clear' ? '' : body
    })).data

    if (shout.body === '') {
      return await message.reply('Successfully cleared shout.')
    } else {
      const embed = new MessageEmbed()
        .addField('Successfully shouted', shout.body)
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      return await message.replyEmbed(embed)
    }
  }
}
