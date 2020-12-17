'use strict'
const Commando = require('discord.js-commando')

const discordService = require('../services/discord')

module.exports = class Command extends Commando.Command {
  constructor (client, info) {
    info.memberName = info.name
    info.argsPromptLimit = info.argsPromptLimit || (info.group === 'admin' || info.group === 'settings') ? 3 : 1
    info.guildOnly = info.guildOnly !== undefined ? info.guildOnly : true
    super(client, info)
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

  async run (message, args) {
    const guild = message.guild ? this.client.bot.getGuild(message.guild.id) : undefined
    try {
      return await this.execute(message, args, guild)
    } catch (err) {
      return this.handleError(err, message)
    }
  }

  handleError (err, message) {
    if (err.response && err.response.data.errors && err.response.data.errors.length > 0) {
      return message.reply(err.response.data.errors[0].message || err.response.data.errors[0].msg)
    } else {
      return message.reply(err.message || err.msg)
    }
  }
}

function _checkPermissions (member, object, roleGroups) {
  let { requiredRoles, bannedRoles } = object
  requiredRoles = discordService.convertRoles(requiredRoles, roleGroups)
  bannedRoles = discordService.convertRoles(bannedRoles, roleGroups)
  return !((requiredRoles.length > 0 && !discordService.hasSomeRole(member, requiredRoles)) ||
    (bannedRoles.length > 0 && discordService.hasSomeRole(member, bannedRoles)))
}
