'use strict'
const commandErrorHandler = (client, command, err, message, _args, _fromPattern, result) => {
  if (err.response?.data.errors?.length > 0) {
    message.reply(err.response.data.errors[0].message ?? err.response.data.errors[0].msg)
  } else {
    message.reply(err.message ?? err.msg)
  }

  result?.prompts.forEach(client.deleteMessage.bind(client))
  result?.answers.forEach(client.deleteMessage.bind(client))
}

module.exports = commandErrorHandler
