'use strict'
const commandCancelHandler = (client, _command, _reason, _message, result) => {
  result?.prompts.forEach(client.deleteMessage.bind(client))
  result?.answers.forEach(client.deleteMessage.bind(client))
}

module.exports = commandCancelHandler
