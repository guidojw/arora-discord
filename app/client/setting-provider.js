'use strict'
const { SettingProvider } = require('discord.js-commando')

const { Guild, Command } = require('../models')

class NSadminProvider extends SettingProvider {
  async init (client) {
    this.client = client

    for (const guildId of client.guilds.cache.keys()) {
      await this.setupGuild(guildId)
    }
    await this.setupGuild('0') // Global settings
  }

  async setupGuild (guildId) {
    const guild = this.client.guilds.cache.get(guildId)

    const [data, created] = await Guild.findOrCreate({ where: { id: guildId } })
    if (created) { // Creating doesn't automatically include the included models.
      await data.reload()
    }

    if (guild) {
      guild._setup(data)
    }

    if (data.commandPrefix) {
      if (guild) {
        guild._commandPrefix = data.commandPrefix
      } else {
        this.client._commandPrefix = data.commandPrefix
      }
    }

    const settings = await data.getCommands()
    if (settings) {
      for (const command of this.client.registry.commands.values()) {
        this.setupGuildCommand(guild, command, settings)
      }
      for (const group of this.client.registry.groups.values()) {
        this.setupGuildGroup(guild, group, settings)
      }
    }

    if (guild) {
      await guild.init()
    }
  }

  setupGuildCommand (guild, command, settings) {
    if (!command.guarded) {
      const commandSettings = settings.find(cmd => cmd.name === command.name)
      if (commandSettings) {
        if (guild) {
          if (!guild._commandsEnabled) {
            guild._commandsEnabled = {}
          }
          guild._commandsEnabled[command.name] = commandSettings.enabled
        } else {
          command._globalEnabled = commandSettings.enabled
        }
      }
    }
  }

  setupGuildGroup (guild, group, settings) {
    if (!group.guarded) {
      const groupSettings = settings.find(cmd => cmd.name === group.name)
      if (guild) {
        if (!guild._groupsEnabled) {
          guild._groupsEnabled = {}
        }
        guild._groupsEnabled[group.id] = groupSettings?.enabled || false
      } else {
        group._globalEnabled = groupSettings?.enabled || true
      }
    }
  }

  commandPrefixChange (guild, prefix) {
    if (!guild) {
      return Guild.update({ commandPrefix: prefix }, { where: { id: '0' } })
    }
    return guild.update({ commandPrefix: prefix })
  }

  async commandStatusChange (type, guild, command, enabled) {
    const guildId = this.constructor.getGuildID(guild)
    const [cmd, created] = await Command.findOrCreate({
      where: {
        name: command.name,
        guildId,
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

module.exports = NSadminProvider
