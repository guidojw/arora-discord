'use strict'
const GuildController = require('../controllers/guild')

const { GroupPermission, Guild, GuildCommand, RolePermission } = require('../models')

class SettingProvider {
  async init (client) {
    this.client = client

    await Promise.all([...client.guilds.cache.mapValues(this.initGuild.bind(this)).values()])

    client.on('commandPrefixChange', this.commandPrefixChange.bind(this))
    client.on('commandStatusChange', this.commandStatusChange.bind(this))
    client.on('groupStatusChange', this.commandStatusChange.bind(this))
  }

  async initGuild (guild) {
    const data = await Guild.findOne({ where: { id: guild.id } }) || await Guild.create({ id: guild.id })
    const guildController = new GuildController(this.client, data)

    if (data.commandPrefix) {
      guild.commandPrefix = data.commandPrefix
    }

    const guildCommands = await data.getCommands()
    if (guildCommands) {
      for (const command of this.client.registry.commands.values()) {
        const commandSettings = guildCommands.find(guildCommand => guildCommand.commandName === command.name)
        if (commandSettings) {
          if (!command.guarded && commandSettings.enabled !== undefined) {
            guild.setCommandEnabled(command.name, commandSettings.enabled)
          }
        }
      }

      for (const group of this.client.registry.groups.values()) {
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

    const groups = await data.getGroups()
    const groupIds = groups.map(group => group.id)
    const groupPermissions = await GroupPermission.findAll({ where: { groupId: groupIds }})
    for (const groupId of groupIds) {
      guildController.groupPermissions[groupId] = groupPermissions.find(groupPermission => {
        return groupPermission.groupId === groupId
      }) ?? []
    }

    const roles = await guild.roles.fetch()
    const roleIds = [...roles.cache.keys()]
    const rolePermissions = await RolePermission.findAll({ where: { roleId: roleIds } })
    for (const roleId of roleIds) {
      guildController.rolePermissions[roleId] = rolePermissions.find(rolePermission => {
        return rolePermission.roleId === roleId
      }) ?? []
    }

    await guildController.init()

    this.client.bot.guilds[guild.id] = guildController
  }

  commandPrefixChange (guild, prefix) {
    const guildController = this.client.bot.getGuild(guild.id)
    return guildController.edit({ commandPrefix: prefix })
  }

  async commandStatusChange (guild, command, enabled) {
    const guildCommand = await GuildCommand.findOne({ where: { guildId: guild.id, commandName: command.name } })
    if (guildCommand) {
      return guildCommand.update({ enabled })
    } else {
      return GuildCommand.create({ guildId: guild.id, commandName: command.name, enabled })
    }
  }
}

module.exports = SettingProvider
