'use strict'
const { Structures } = require('discord.js')
const { TextChannelGroupManager } = require('../managers')

const NSadminTextChannel = Structures.extend('TextChannel', TextChannel => {
  class NSadminTextChannel extends TextChannel {
    _setup (data) {

    }

    get groups () {
      return new TextChannelGroupManager(this)
    }
  }

  return NSadminTextChannel
})

module.exports = NSadminTextChannel
