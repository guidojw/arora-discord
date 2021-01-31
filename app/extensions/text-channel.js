'use strict'
const TextChannelGroupManager = require('../managers/text-channel-group')

const { Structures } = require('discord.js')

const NSadminTextChannel = Structures.extend('TextChannel', TextChannel => {
  class NSadminTextChannel extends TextChannel {
    constructor (...args) {
      super(...args)

      this.groups = new TextChannelGroupManager(this)
    }
  }

  return NSadminTextChannel
})

module.exports = NSadminTextChannel
