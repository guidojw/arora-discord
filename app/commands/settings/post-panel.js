'use strict'
const BaseCommand = require('../base')

const { MessageEmbed } = require('discord.js')
const { Channel, Panel } = require('../../models')

class PostPanelCommand extends BaseCommand {
  constructor (client) {
    super(client, {
      group: 'settings',
      name: 'postpanel',
      aliases: ['postpnl'],
      description: 'Posts a panel in a channel.',
      clientPermissions: ['SEND_MESSAGES'],
      args: [{
        key: 'panelId',
        prompt: 'What panel would you like to post?',
        type: 'integer'
      }, {
        key: 'channel',
        prompt: 'In what channel do you want to post this panel?',
        type: 'channel'
      }]
    })
  }

  async run (message, { panelId, channel }) {
    const panel = await Panel.findOne({ where: { id: panelId, guildId: message.guild.id } })
    if (!panel) {
      return message.reply('Panel not found.')
    }

    const embed = new MessageEmbed(JSON.parse(panel.content))
    await channel.send(embed)
    await Channel.findOrCreate({
      where: {
        id: channel.id,
        guildId: message.guild.id
      }
    })
    await panel.update({ channelId: channel.id })

    return message.reply(`Successfully posted panel **${panelId}** in ${channel}.`)
  }
}

module.exports = PostPanelCommand
