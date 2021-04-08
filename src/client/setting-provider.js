'use strict'

const { SettingProvider } = require('discord.js-commando')

const { Guild, Command } = require('../models')

class AroraProvider extends SettingProvider {
  async init (client) {
    this.client = client

    const settings = await Command.findAll()
    for (const command of client.registry.commands.values()) {
      await this.setupCommand(command, settings)
    }
    for (const group of client.registry.groups.values()) {
      await this.setupGroup(group, settings)
    }

    for (const guildId of client.guilds.cache.keys()) {
      await this.setupGuild(guildId)
    }
    await this.setupGuild('0') // global settings
  }

  async setupCommand (command, settings) {
    const commandSettings = settings.find(cmd => cmd.type === 'command' && cmd.name === command.name) ||
      await Command.create({ name: command.name, type: 'command' })
    command.aroraId = commandSettings.id
  }

  async setupGroup (group, settings) {
    const groupSettings = settings.find(grp => grp.type === 'group' && grp.name === group.id) ||
      await Command.create({ name: group.id, type: 'group' })
    group.aroraId = groupSettings.id
  }

  async setupGuild (guildId) {
    const guild = this.client.guilds.cache.get(guildId)
    const [data] = await Guild.findOrCreate({ where: { id: guildId } })

    // Band-aid fix. idk why, but somehow after merging https://github.com/guidojw/arora-discord/pull/164 the bot's
    // memory usage raised rapidly on start up and kept causing numerous out of memory errors. I tried several things
    // and it seems to be Sequelize related. Removing models from Guild model's defaultScope somehow fixed the issue.
    if (guild) {
      data.channels = await data.getChannels()
      data.roles = await data.getRoles()
      // remove more from the Guild defaultScope and put it here if above error returns..
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
    for (const command of this.client.registry.commands.values()) {
      this.setupGuildCommand(guild, command, settings)
    }
    for (const group of this.client.registry.groups.values()) {
      this.setupGuildGroup(guild, group, settings)
    }

    if (guild) {
      await guild.init()
    }
  }

  setupGuildCommand (guild, command, settings) {
    if (!command.guarded) {
      const commandSettings = settings.find(cmd => cmd.type === 'command' && cmd.name === command.name)
      if (commandSettings) {
        if (guild) {
          if (!guild._commandsEnabled) {
            guild._commandsEnabled = {}
          }
          guild._commandsEnabled[command.name] = commandSettings.GuildCommand.enabled
        } else {
          command._globalEnabled = commandSettings.GuildCommand.enabled
        }
      }
    }
  }

  setupGuildGroup (guild, group, settings) {
    if (!group.guarded) {
      const groupSettings = settings.find(grp => grp.type === 'group' && grp.name === group.id)
      if (guild) {
        if (!guild._groupsEnabled) {
          guild._groupsEnabled = {}
        }
        guild._groupsEnabled[group.id] = groupSettings?.GuildCommand.enabled ?? false
      } else {
        group._globalEnabled = groupSettings?.GuildCommand.enabled ?? false
      }
    }
  }

  onCommandPrefixChange (guild, prefix) {
    if (!guild) {
      Guild.update({ commandPrefix: prefix }, { where: { id: '0' } })
      return
    }
    guild.update({ commandPrefix: prefix })
  }

  async onCommandStatusChange (type, guild, commandOrGroup, enabled) {
    const guildId = this.constructor.getGuildID(guild)
    const data = await Guild.findOne({ where: { id: guildId !== 'global' ? guildId : 0 } })
    data.addCommand(commandOrGroup.aroraId, { through: { enabled } })
  }
}

module.exports = AroraProvider
