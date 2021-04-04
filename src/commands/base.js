'use strict'

const Commando = require('discord.js-commando')

class BaseCommand extends Commando.Command {
  constructor (client, info) {
    info.memberName = info.name
    info.argsPromptLimit = info.argsPromptLimit || (info.group === 'admin' || info.group === 'settings') ? 3 : 1
    info.guildOnly = typeof info.guildOnly !== 'undefined' ? info.guildOnly : true
    super(client, info)

    this.requiresApi = Boolean(info.requiresApi)
    this.requiresRobloxGroup = Boolean(info.requiresRobloxGroup)
    this.requiresSingleGuild = Boolean(info.requiresSingleGuild)
  }

  hasPermission (message, ownerOverride = true) {
    if (ownerOverride && this.client.isOwner(message.author)) {
      return true
    }

    const result = super.hasPermission(message, ownerOverride)
    if (!result || typeof result === 'string' || this.guarded || this.group.guarded) {
      return result
    }

    return message.member.canRunCommand(this)
  }

  onError (_err, _message, _args, _fromPattern, _result) {
    // The commandError event handler takes care of this.
  }
}

module.exports = BaseCommand
