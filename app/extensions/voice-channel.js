'use strict'
const { Structures } = require('discord.js')
const { Channel } = require('../models')

const NSadminVoiceChannel = Structures.extend('VoiceChannel', VoiceChannel => {
  class NSadminVoiceChannel extends VoiceChannel {
    async fetchToLinks () {
      const data = await getData(this)
      const toLinks = await data?.getToLinks() ?? []

      return this.guild.channels.cache.filter(channel => toLinks.some(link => link.id === channel.id))
    }

    async linkChannel (channel) {
      const [data] = await Channel.findOrCreate({ where: { id: this.id, guildId: this.guild.id } })
      await Channel.findOrCreate({ where: { id: channel.id, guildId: this.guild.id } })
      const added = typeof await data.addToLink(channel.id) !== 'undefined'

      if (!added) {
        throw new Error('Voice channel does already have linked text channel.')
      } else {
        return this
      }
    }

    async unlinkChannel (channel) {
      const data = await getData(this)
      const removed = await data?.removeToLink(channel.id) === 1

      if (!removed) {
        throw new Error('Voice channel does not have linked text channel.')
      } else {
        return this
      }
    }
  }

  return NSadminVoiceChannel
})

function getData (channel) {
  return Channel.findOne({
    where: {
      id: channel.id,
      guildId: channel.guild.id
    }
  })
}

module.exports = NSadminVoiceChannel
