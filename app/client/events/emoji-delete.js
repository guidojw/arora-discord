'use strict'
const { Emoji } = require('../../models')

const emojiDeleteHandler = (_client, emoji) => {
  Emoji.destroy({ where: { id: emoji.id } })
}

module.exports = emojiDeleteHandler
