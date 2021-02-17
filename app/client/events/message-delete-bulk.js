'use strict'
const messageDeleteHandler = require('./message-delete')

const messageDeleteBulkHandler = (client, messages) => {
  return Promise.all(messages.map(messageDeleteHandler.bind(messageDeleteBulkHandler, client)))
}

module.exports = messageDeleteBulkHandler
