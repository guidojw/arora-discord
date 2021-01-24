'use strict'
const { Channel } = require('../../models')

const channelDeleteHandler = (_client, channel) => {
  return Channel.destroy({ where: { id: channel.id } })
}

module.exports = channelDeleteHandler
