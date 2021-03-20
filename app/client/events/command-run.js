'use strict'
const { stripIndents } = require('common-tags')

const commandRunHandler = async (client, command, promise, message, _args, _fromPattern, collResult) => {
  try {
    await promise
  } catch (err) {
    // Command execution errors are handled by the commandError event handler.
    return
  }

  collResult.prompts.map(client.deleteMessage.bind(client))
  collResult.answers.map(client.deleteMessage.bind(client))

  const guild = message.guild || client.mainGuild
  guild.log(
    message.author,
    stripIndents`
    ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
    ${message.content}
    `
  )
}

module.exports = commandRunHandler
