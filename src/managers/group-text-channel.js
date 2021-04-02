'use strict'

const { TextChannel } = require('discord.js')
const { Channel, Group } = require('../models')

class GroupTextChannelManager {
  constructor (group) {
    this.group = group
    this.guild = group.guild
  }

  get cache () {
    return this.guild.channels.cache.filter(channel => this.group._channels.includes(channel.id))
  }

  async add (channel) {
    channel = this.guild.channels.resolve(channel)
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error('Invalid channel.')
    }
    if (this.cache.has(channel.id)) {
      throw new Error('Group already contains channel.')
    }

    const [data] = await Channel.findOrCreate({
      where: {
        id: channel.id,
        guildId: this.guild.id
      }
    })
    await data.addGroup(this.group.id)
    this.group._channels.push(channel.id)

    return this.group
  }

  async remove (channel) {
    const id = this.guild.channels.resolveID(channel)
    if (!id) {
      throw new Error('Invalid channel.')
    }
    if (!this.group._channels.includes(id)) {
      throw new Error('Group does not contain channel.')
    }

    const group = await Group.findByPk(this.group.id)
    await group.removeChannel(id)
    this.group._channels = this.group._channels.filter(channelId => channelId !== id)

    return this.group
  }
}

module.exports = GroupTextChannelManager
