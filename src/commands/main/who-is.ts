import type { CommandoClient, CommandoMessage } from 'discord.js-commando'
import { type Message, MessageEmbed } from 'discord.js'
import BaseCommand from '../base'
import type { RobloxUser } from '../../types/roblox-user'
import applicationConfig from '../../configs/application'
import pluralize from 'pluralize'
import { timeUtil } from '../../util'
import { userService } from '../../services'

const { getDate } = timeUtil

export default class WhoIsCommand extends BaseCommand {
  public constructor (client: CommandoClient) {
    super(client, {
      group: 'main',
      name: 'whois',
      aliases: ['user', 'profile'],
      description: 'Posts the Roblox information of given user.',
      examples: ['whois', 'whois Happywalker', 'whois 6882179', 'whois @Happywalker'],
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'user',
        prompt: 'Of which user would you like to know the Roblox information?',
        type: 'roblox-user',
        default: 'self'
      }]
    })
  }

  public async run (
    message: CommandoMessage,
    { user }: { user: RobloxUser }
  ): Promise<Message | Message[] | null> {
    const userInfo = await userService.getUser(user.id)
    const age = Math.floor((Date.now() - new Date(userInfo.created).getTime()) / (24 * 60 * 60 * 1000))
    const outfits = await userService.getUserOutfits(user.id)

    const embed = new MessageEmbed()
      .setAuthor(userInfo.name ?? 'Unknown', `https://www.roblox.com/headshot-thumbnail/image?width=150&height=150&format=png&userId=${user.id}`)
      .setThumbnail(`https://www.roblox.com/outfit-thumbnail/image?width=150&height=150&format=png&userOutfitId=${outfits[0]?.id ?? 0}`)
      .setColor(message.guild.primaryColor ?? applicationConfig.defaultColor)
      .addField('Blurb', userInfo.description !== '' ? userInfo.description : 'No blurb')
      .addField('Join Date', getDate(new Date(userInfo.created)), true)
      .addField('Account Age', pluralize('day', age, true), true)
      .addField('\u200b', '\u200b', true)
      .setFooter(`User ID: ${user.id}`)
      .setTimestamp()
    if (message.guild.robloxGroupId !== null) {
      const groupsRoles = await userService.getGroupsRoles(user.id)
      const group = groupsRoles.find(group => group.group.id === message.guild.robloxGroupId)
      embed
        .addField('Role', group?.role.name ?? 'Guest', true)
        .addField('Rank', group?.role.rank ?? 0, true)
        .addField('\u200b', '\u200b', true)
    }
    embed.addField('\u200b', `[Profile](https://www.roblox.com/users/${user.id}/profile)`)
    return await message.replyEmbed(embed)
  }
}
