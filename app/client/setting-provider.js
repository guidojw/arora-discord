'use strict'
const { Guild, Command } = require('../models')

class SettingProvider {
  async init (client) {
    this.client = client

    for (const guild of this.client.guilds.cache.values()) {
      const [data, created] = await Guild.findOrCreate({ where: { id: guild.id } })
      if (created) { // Creating doesn't automatically include the included models.
        await data.reload()
      }
      this.setupGuild(guild, data)
    }

    client.on('commandPrefixChange', this.commandPrefixChange.bind(this))
    client.on('commandStatusChange', this.commandStatusChange.bind(this, 'command'))
    client.on('groupStatusChange', this.commandStatusChange.bind(this, 'group'))
  }

  async setupGuild (guild, data) {
    guild._setup(data)

    if (data.commandPrefix) {
      guild._commandPrefix = data.commandPrefix
    }

    const commands = await data.getCommands()
    if (commands) {
      if (!guild._commandsEnabled) {
        guild._groupsEnabled = {}
      }
      if (!guild._commandsEnabled) {
        guild._commandsEnabled = {}
      }

      for (const command of this.client.registry.commands.values()) {
        const commandSettings = commands.find(cmd => cmd.name === command.name)
        if (commandSettings) {
          if (!command.guarded && commandSettings.enabled !== undefined) {
            guild._commandsEnabled[command.name] = commandSettings.enabled
          }
        }
      }

      for (const group of this.client.registry.groups.values()) {
        const groupSettings = commands.find(cmd => cmd.name === group.name)
        if (groupSettings) {
          if (!group.guarded) {
            guild._groupsEnabled[group.id] = groupSettings.enabled !== undefined ? groupSettings.enabled : false
          }
        } else {
          if (!group.guarded) {
            guild._groupsEnabled[group.id] = false
          }
        }
      }
    }

    await guild.init()
  }

  commandPrefixChange (guild, prefix) {
    return guild.update({ commandPrefix: prefix })
  }

  async commandStatusChange (type, guild, command, enabled) {
    const [cmd, created] = await Command.findOrCreate({
      where: {
        guildId: guild.id,
        name: command.name,
        type
      },
      defaults: {
        enabled
      }
    })
    if (!created) {
      await cmd.update({ enabled })
    }
  }
}

module.exports = SettingProvider
