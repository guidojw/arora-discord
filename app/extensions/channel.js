'use strict'
const { Structures } = require('discord.js')
const { GuildChannelGroupManager } = require('../managers')

const NSadminChannel = Structures.extend('Channel', Channel => {
  class NSadminChannel extends Channel {
    constructor (...args) {
      super(...args)

      this.groups = new GuildChannelGroupManager(this)

      this._groups = []
    }

    _setup (data) {
      if (data.groups) {
        this._groups = data.groups.map(group => group.id)
      }
    }
  }

  return NSadminChannel
})

module.exports = NSadminChannel
