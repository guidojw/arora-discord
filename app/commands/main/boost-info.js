'use strict'
const pluralize = require('pluralize')
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { diffDays } = require('../../util').timeUtil

class BoostInfoCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'main',
      name: 'boostinfo',
      description: 'Posts the boost information of given member.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'member',
        prompt: 'Whose boost info do you want to know?',
        type: 'member',
        default: message => message.member
      }]
    })
  }

  async run (message, { member }) {
    if (!member.premiumSince) {
      return message.reply(`${message.argString ? 'Member is not' : 'You\'re not'} a booster.`)
    }
    const now = new Date()
    const diff = diffDays(member.premiumSince, now)
    const months = Math.floor(diff / 30)
    const days = diff % 30
    const emoji = this.client.mainGuild.emojis.cache.find(emoji => emoji.name.toLowerCase() === 'boost')

    if (member.user.partial) {
      await member.user.fetch()
    }
    const embed = new MessageEmbed()
      .setTitle(`${member.user.tag} ${emoji || ''}`)
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`Has been boosting this server for **${pluralize('month', months, true)}** and **${pluralize('day', days, true)}**!`)
      .setFooter('* Discord Nitro months are 30 days long.')
      .setColor(0xff73fa)
    return message.replyEmbed(embed)
  }
}

module.exports = BoostInfoCommand
