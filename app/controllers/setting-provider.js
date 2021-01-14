'use strict'
const { Guild, GuildCommand } = require('../models')

class SettingProvider {
  async init (client) {
    this.client = client

    for (const guild of this.client.guilds.cache.values()) {
      const data = await Guild.findOne({ where: { id: guild.id } }) ||
        await (await Guild.create({ id: guild.id })).reload()
      this.setupGuild(guild, data)
    }

    client.on('commandPrefixChange', this.commandPrefixChange.bind(this))
    client.on('commandStatusChange', this.commandStatusChange.bind(this))
    client.on('groupStatusChange', this.commandStatusChange.bind(this))
  }

  async setupGuild (guild, data) {
    guild._setup(data)

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

    await guild.init()
  }

  commandPrefixChange (guild, prefix) {
    const guildController = this.client.bot.guilds.get(guild.id)
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
