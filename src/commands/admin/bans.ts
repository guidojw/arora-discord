import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Guild, type Message, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import applicationConfig from '../../configs/application'
import { groupService } from '../../services'
import pluralize from 'pluralize'
import { timeUtil } from '../../util'

const { getDate, getTime } = timeUtil

export default class BansCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'bans',
      aliases: ['banlist', 'baninfo'],
      description: 'Lists info of current bans/given user\'s ban.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of whose ban would you like to know the information?',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage & { guild: Guild & { robloxGroupId: number } },
    { user }: { user: RobloxUser | '' }
  ): Promise<Message | Message[] | null> {
    if (user !== '') {
      const ban = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/bans/${user.id}`)).data

      const days = ban.duration / (24 * 60 * 60 * 1000)
      const date = new Date(ban.date)
      let extensionDays = 0
      for (const extension of ban.extensions) {
        extensionDays += extension.duration / (24 * 60 * 60 * 1000)
      }
      const extensionString = extensionDays !== 0
        ? ` (${Math.sign(extensionDays) === 1 ? '+' : ''}${extensionDays})`
        : ''
      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s ban`)
        .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Duration', `${days}${extensionString} ${pluralize('day', days + extensionDays)}`, true)
        .addField('Reason', ban.reason)

      return await message.replyEmbed(embed)
    } else {
      const bans = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/bans?sort=date`)).data
      if (bans.length === 0) {
        return await message.reply('There are currently no bans.')
      }

      const embeds = await groupService.getBanEmbeds(message.guild.robloxGroupId, bans)
      for (const embed of embeds) {
        await message.author.send(embed)
      }

      return await message.reply('Sent you a DM with the banlist.')
    }
  }
}
