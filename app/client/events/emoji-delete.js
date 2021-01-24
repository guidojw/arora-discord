'use strict'
const { Emoji } = require('../../models')

const emojiDeleteHandler = (_client, emoji) => {
  return Emoji.destroy({ where: { id: emoji.id } })
}

module.exports = emojiDeleteHandler
