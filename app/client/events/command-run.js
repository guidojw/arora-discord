'use strict'
const BaseEvent = require('./base')

const { stripIndents } = require('common-tags')

class CommandRunEvent extends BaseEvent {
  async handle (command, promise, message, _args, _fromPattern, collResult) {
    let result
    try {
      result = await promise
    } catch (err) {
      // Command execution errors are handled by the commandError event.
      return
    }

    await this.client.handleCommandDeleteMessages(command, result, message, collResult)

    const guild = message.guild ? this.client.guilds.cache.get(message.guild.id) : this.client.mainGuild
    await guild.log(
      message.author,
      stripIndents`
      ${message.author} **used** \`${command.name}\` **command in** ${message.channel} [Jump to Message](${message.url})
      ${message.content}
      `
    )
  }
}

module.exports = CommandRunEvent
