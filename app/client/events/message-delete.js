'use strict'
const { Message } = require('../../models')

const messageDeleteHandler = (_client, message) => {
  Message.destroy({ where: { id: message.id } })
}

module.exports = messageDeleteHandler
