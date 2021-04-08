'use strict'

const { Structures } = require('discord.js')
const { TextChannelGroupManager } = require('../managers')

const AroraTextChannel = Structures.extend('TextChannel', TextChannel => {
  class AroraTextChannel extends TextChannel {
    get groups () {
      return new TextChannelGroupManager(this)
    }
  }

  return AroraTextChannel
})

module.exports = AroraTextChannel
