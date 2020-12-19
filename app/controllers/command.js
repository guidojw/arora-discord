'use strict'
const Commando = require('discord.js-commando')

const discordService = require('../services/discord')

class Command extends Commando.Command {
  constructor (client, info) {
    info.memberName = info.name
    info.argsPromptLimit = info.argsPromptLimit || (info.group === 'admin' || info.group === 'settings') ? 3 : 1
    info.guildOnly = info.guildOnly !== undefined ? info.guildOnly : true
    super(client, info)

    this.deleteMessages = typeof info.deleteMessages !== 'undefined' ? info.deleteMessages : false
  }

  hasPermission (message, ownerOverride) {
    if (!this.ownerOnly) {
      // const guild = this.client.bot.getGuild(message.guild.id)
      // const roleGroups = guild.getData('roleGroups')
      // const member = message.member
      // const command = message.command
      // const group = command.group
      //
      // if (!_checkPermissions(member, group, roleGroups)) {
      //   return false
      // }
      // if (!_checkPermissions(member, command, roleGroups)) {
      //   return false
      // }
    }

    return super.hasPermission(message, ownerOverride)
  }

  onError (_err, _message, _args, _fromPattern, _result) {
    // The commandError event in the Bot class takes care of this.
  }

  async run (message, args, _fromPattern, _result) {
    const guild = message.guild ? this.client.bot.getGuild(message.guild.id) : undefined
    return this.execute(message, args, guild)
  }
}

function _checkPermissions (member, object, roleGroups) {
  let { requiredRoles, bannedRoles } = object
  requiredRoles = discordService.convertRoles(requiredRoles, roleGroups)
  bannedRoles = discordService.convertRoles(bannedRoles, roleGroups)
  return !((requiredRoles.length > 0 && !discordService.hasSomeRole(member, requiredRoles)) ||
    (bannedRoles.length > 0 && discordService.hasSomeRole(member, bannedRoles)))
}

module.exports = Command
