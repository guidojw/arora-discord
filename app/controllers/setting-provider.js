'use strict'
const GuildController = require('../controllers/guild')

const { Guild, GuildCommand, RolePermission } = require('../models')

class SettingProvider {
  async init (client) {
    this.client = client

    for (const guild of client.guilds.cache.values()) {
      // Look up Guild data in database or create a new instance, then initiate a new GuildController with this data.
      const data = await Guild.findOne({ where: { id: guild.id }}) || await Guild.create({ id: guild.id })
      const guildController = new GuildController(client, data)

      // Initiate Guild's commandPrefix.
      if (data.commandPrefix) {
        guild.commandPrefix = data.commandPrefix
      }

      // Initiate Guild's commandStates (Command and CommandGroup states).
      const guildCommands = await data.getCommands()
      if (guildCommands) {
        for (const command of client.registry.commands.values()) {
          const commandSettings = guildCommands.find(guildCommand => guildCommand.commandName === command.name)
          if (commandSettings) {
            if (!command.guarded && commandSettings.enabled !== undefined) {
              guild.setCommandEnabled(command.name, commandSettings.enabled)
            }
          }
        }

        for (const group of client.registry.groups.values()) {
          const groupSettings = guildCommands.find(guildCommand => guildCommand.commandName === group.name)
          if (groupSettings) {
            if (!group.guarded) {
              guild.setGroupEnabled(group, groupSettings.enabled !== undefined ? groupSettings.enabled : false)
            }
          } else {
            if (!group.guarded) {
              guild.setGroupEnabled(group, false)
            }
          }
        }
      }

      // Initiate Guild's groupPermissions.
      const groups = await data.getGroups()
      for (const group of groups) {
        guildController.groupPermissions[group.id] = await group.getPermissions()
      }

      // Initiate Guild's rolePermissions.
      const roles = await guild.roles.fetch()
      for (const role of roles.cache.values()) {
        guildController.rolePermissions[role.id] = await RolePermission.findAll({ where: { roleId: role.id } })
      }

      // Initiate GuildController.
      await guildController.init()

      // Initiating Guild and its controller is finished, add it to the bot's guilds list.
      client.bot.guilds[guild.id] = guildController
    }

    client.on('commandPrefixChange', this.commandPrefixChange.bind(this))
    client.on('commandStatusChange', this.commandStatusChange.bind(this))
    client.on('groupStatusChange', this.commandStatusChange.bind(this))
  }

  commandPrefixChange (guild, prefix) {
    const guildController = this.client.bot.getGuild(guild.id)
    return guildController.edit({ commandPrefix: prefix })
  }

  async commandStatusChange (guild, command, enabled) {
    const guildCommand = await GuildCommand.findOne({ where: { guildId: guild.id, commandName: command.name }})
    if (guildCommand) {
      return guildCommand.update({ enabled })
    } else {
      return GuildCommand.create({ guildId: guild.id, commandName: command.name, enabled })
    }
  }
}

module.exports = SettingProvider
