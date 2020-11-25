'use strict'
module.exports = class SettingProvider {
  async init (client) {
    this.bot = client.bot

    for (const guild of client.guilds.cache.values()) {
      const settings = await this.getSettings(guild)
      if (settings) {
        if (settings.prefix) {
          guild.commandPrefix = settings.prefix
        }

        if (settings.commands) {
          for (const command of client.registry.commands.values()) {
            const commandSettings = settings.commands[command.name]
            if (commandSettings) {
              if (!command.guarded && commandSettings.enabled !== undefined) {
                guild.setCommandEnabled(command.name, commandSettings.enabled)
              }

              command.requiredRoles = commandSettings.requiredRoles
              command.bannedRoles = commandSettings.bannedRoles
            }
          }
        }
      }

      for (const group of client.registry.groups.values()) {
        const groupSettings = settings && settings.groups ? settings.groups[group.id] : undefined
        if (groupSettings) {
          if (!group.guarded) {
            guild.setGroupEnabled(group, groupSettings.enabled !== undefined ? groupSettings.enabled : false)
          }

          group.requiredRoles = groupSettings.requiredRoles
          group.bannedRoles = groupSettings.bannedRoles
        } else {
          if (!group.guarded) {
            guild.setGroupEnabled(group, false)
          }
        }
      }
    }

    client.on('commandPrefixChange', (guild, prefix) => {
      this.set(guild, 'prefix', prefix)
    })

    client.on('commandStatusChange', async (guild, command, enabled) => {
      const commandsSettings = await this.get(guild, 'commands', {})
      if (!commandsSettings[command.name]) {
        commandsSettings[command.name] = {}
      }
      commandsSettings[command.name].enabled = enabled
      this.set(guild, 'commandStates', commandsSettings)
    })

    client.on('groupStatusChange', async (guild, group, enabled) => {
      const groupsSettings = await this.get(guild, 'groups', {})
      if (!groupsSettings[group.id]) {
        groupsSettings[group.id] = {}
      }
      groupsSettings[group.id].enabled = enabled
      this.set(guild, 'groupStates', groupsSettings)
    })
  }

  async get (guild, key, defVal) {
    const settings = await this.getSettings(guild)
    return settings[key] || defVal
  }

  async set (guild, key, val) {
    const settings = await this.getSettings(guild)
    settings[key] = val
    return this.setSettings(guild, settings)
  }

  async getSettings (guild) {
    return this.bot.getGuild(guild.id).getData('settings') || {}
  }

  async setSettings (guild, settings) {
    await this.bot.getGuild(guild.id).setData('settings', settings)
  }
}
