'use strict'

const pluralize = require('pluralize')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { userService } = require('../../services')
const { getDate } = require('../../util').timeUtil

class WhoIsCommand extends BaseCommand {
  constructor (client) {
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

  async run (message, { user }) {
    user = await userService.getUser(user.id)
    const age = Math.floor((Date.now() - new Date(user.created).getTime()) / 86400000)
    const outfits = await userService.getUserOutfits(user.id)

    const embed = new MessageEmbed()
      .setAuthor(user.name, `https://www.roblox.com/headshot-thumbnail/image?width=150&height=150&format=png&userId=${user.id}`)
      .setThumbnail(`https://www.roblox.com/outfit-thumbnail/image?width=150&height=150&format=png&userOutfitId=${outfits[0].id}`)
      .setColor(message.guild.primaryColor)
      .addField('Blurb', user.description !== '' ? user.description : 'No blurb')
      .addField('Join Date', getDate(new Date(user.created)), true)
      .addField('\u200b', '\u200b', true)
      .addField('Account Age', pluralize('day', age, true), true)
      .setFooter(`User ID: ${user.id}`)
      .setTimestamp()
    if (message.guild.robloxGroupId !== null) {
      const groupsRoles = await userService.getGroupsRoles(user.id)
      const group = groupsRoles.find(group => group.group.id === message.guild.robloxGroupId)
      embed
        .addField('Role', group.role.name ?? 'Guest', true)
        .addField('\u200b', '\u200b', true)
        .addField('Rank', group.role.rank ?? 0, true)
    }
    embed.addField('\u200b', `[Profile](https://www.roblox.com/users/${user.id}/profile)`)
    return message.replyEmbed(embed)
  }
}

module.exports = WhoIsCommand
