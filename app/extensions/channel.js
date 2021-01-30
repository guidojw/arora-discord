'use strict'
const { Structures } = require('discord.js')
const { GuildChannelGroupManager } = require('../managers')

const NSadminChannel = Structures.extend('Channel', Channel => {
  class NSadminChannel extends Channel {
    constructor (...args) {
      super(...args)

      this.groups = new GuildChannelGroupManager(this)
    }
  }

  return NSadminChannel
})

module.exports = NSadminChannel
