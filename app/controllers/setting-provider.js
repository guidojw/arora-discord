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
            if (settings.commands[command.id] && settings.commands[command.id].enabled !== undefined) {
              guild.setCommandEnabled(command.id, settings.commands[command.id].enabled)
            }
          }
        }
      }

      for (const group of client.registry.groups.values()) {
        if (!group.guarded) {
          guild.setGroupEnabled(group, settings && settings.groups && settings.groups[group.id] && settings
            .groups[group.id].enabled)
        }
      }
    }

    client.on('commandPrefixChange', (guild, prefix) => {
      this.set(guild, 'prefix', prefix)
    })

    client.on('commandStatusChange', async (guild, command, enabled) => {
      const commandSettings = await this.get(guild, 'commands', {})
      if (!commandSettings[command.id]) {
        commandSettings[command.id] = {}
      }
      commandSettings[command.id].enabled = enabled
      this.set(guild, 'commandStates', commandSettings)
    })

    client.on('groupStatusChange', async (guild, group, enabled) => {
      const groupSettings = await this.get(guild, 'groups', {})
      if (!groupSettings[group.id]) {
        groupSettings[group.id] = {}
      }
      groupSettings[group.id].enabled = enabled
      this.set(guild, 'groupStates', groupSettings)
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
