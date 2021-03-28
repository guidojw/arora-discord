'use strict'

const { stripIndents } = require('common-tags')

const commandRunHandler = async (client, command, promise, message, _args, _fromPattern, result) => {
  try {
    await promise
  } catch {
    // Command execution errors are handled by the commandError event handler.
    return
  }

  result?.prompts.forEach(client.deleteMessage.bind(client))
  result?.answers.forEach(client.deleteMessage.bind(client))

  const guild = message.guild || client.mainGuild
  guild.log(
    message.author,
    stripIndents`
    ${message.author} **used** \`${command.name}\` **command in** ${message.channel} ${message.channel.type !== 'dm' ? `[Jump to Message](${message.url})` : ''}
    ${message.content}
    `
  )
}

module.exports = commandRunHandler
