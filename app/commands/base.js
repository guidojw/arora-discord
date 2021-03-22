'use strict'
const Commando = require('discord.js-commando')

class BaseCommand extends Commando.Command {
  constructor (client, info) {
    info.memberName = info.name
    info.argsPromptLimit = info.argsPromptLimit || (info.group === 'admin' || info.group === 'settings') ? 3 : 1
    info.guildOnly = info.guildOnly !== undefined ? info.guildOnly : true

    if (info.group === 'settings') {
      if (typeof info.userPermissions === 'undefined') {
        info.userPermissions = []
      }
      info.userPermissions.push('MANAGE_GUILD')
    }

    super(client, info)
  }

  hasPermission (message, ownerOverride = true) {
    ownerOverride = false // TODO: remove
    if (ownerOverride && this.client.isOwner(message.author)) {
      return true
    }

    const result = super.hasPermission(message, ownerOverride)
    if (!result || typeof result === 'string' || this.group.guarded || this.group.id === 'settings') {
      return result
    }

    return message.member.canRunCommand(this)
  }

  onError (_err, _message, _args, _fromPattern, _result) {
    // The commandError event handler takes care of this.
  }
}

module.exports = BaseCommand
