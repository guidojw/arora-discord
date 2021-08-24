import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import type { Guild, Message } from 'discord.js'
import BaseCommand from '../base'
import type { Exile } from '../../services/group'
import { MessageEmbed } from 'discord.js'
import type { RobloxUser } from '../../types/roblox-user'
import { applicationAdapter } from '../../adapters'
import { groupService } from '../../services'
import { timeUtil } from '../../util'

const { getDate, getTime } = timeUtil

export default class ExilesCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'admin',
      name: 'exiles',
      aliases: ['exilelist', 'exileinfo'],
      description: 'Lists info of current exiles/given user\'s exile.',
      clientPermissions: ['SEND_MESSAGES'],
      requiresApi: true,
      requiresRobloxGroup: true,
      args: [{
        key: 'user',
        type: 'roblox-user',
        prompt: 'Of whose exile would you like to know the information?',
        default: ''
      }]
    })
  }

  public async run (
    message: CommandoMessage & { guild: Guild & { robloxGroupId: number } },
    { user }: { user: RobloxUser | '' }
  ): Promise<Message | Message[] | null> {
    if (user !== '') {
      const exile: Exile = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/exiles/${user.id}`)).data

      const date = new Date(exile.date)
      const embed = new MessageEmbed()
        .setTitle(`${user.username ?? user.id}'s exile`)
        .setColor(message.guild.primaryColor ?? 0xffffff)
        .addField('Start date', getDate(date), true)
        .addField('Start time', getTime(date), true)
        .addField('Reason', exile.reason)

      return await message.replyEmbed(embed)
    } else {
      const exiles = (await applicationAdapter('GET', `v1/groups/${message.guild.robloxGroupId}/exiles?sort=date`)).data
      if (exiles.length === 0) {
        return await message.reply('There are currently no exiles.')
      }

      const embeds = await groupService.getExileEmbeds(exiles)
      for (const embed of embeds) {
        await message.author.send(embed)
      }

      return await message.reply('Sent you a DM with the current exiles.')
    }
  }
}
