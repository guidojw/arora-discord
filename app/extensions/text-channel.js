'use strict'
const { Structures } = require('discord.js')
const { TextChannelGroupManager } = require('../managers')

const NSadminTextChannel = Structures.extend('TextChannel', TextChannel => {
  class NSadminTextChannel extends TextChannel {
    constructor (...args) {
      super(...args)

      this.groups = new TextChannelGroupManager(this)
    }

    _setup (data) {

    }
  }

  return NSadminTextChannel
})

module.exports = NSadminTextChannel
