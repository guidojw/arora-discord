'use strict'
const BaseEvent = require('./base')

const { Emoji } = require('../../models')

class EmojiDeleteEvent extends BaseEvent {
  handle (emoji) {
    return Emoji.destroy({ where: { id: emoji.id } })
  }
}

module.exports = EmojiDeleteEvent
