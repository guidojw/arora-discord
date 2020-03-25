'use strict'
module.exports = class SettingProvider {
    async init (client) {
        this.bot = client.bot

        for (const guild of client.guilds.cache.values()) {
            const settings = await this.getSettings(guild)
            if (settings) {
                if (settings.prefix) guild._commandPrefix = settings.prefix

                if (settings.commandStates) {
                    if (!guild._commandsEnabled) guild._commandsEnabled = {}
                    for (const command of client.registry.commands.values()) {
                        if (settings.commandStates[command.name] !== undefined) {
                            guild._commandsEnabled[command.name] = settings.commandStates[command.name]
                        }
                    }
                }

                if (settings.groupStates) {
                    if (!guild._groupsEnabled) guild._groupsEnabled = {}
                    for (const group of client.registry.groups.values()) {
                        if (settings.groupStates[group.name] !== undefined) {
                            guild._groupsEnabled[group.name] = settings.groupStates[group.name]
                        }
                    }
                }
            }
        }

        client.on('commandPrefixChange', (guild, prefix) => {
            this.set(guild, 'prefix', prefix)
        })
        client.on('commandStatusChange', async (guild, command, enabled) => {
            const commandStates = await this.get(guild, 'commandStates', {})
            commandStates[command.name] = enabled
            this.set(guild, 'commandStates', commandStates)
        })
        client.on('groupStatusChange', async (guild, group, enabled) => {
            const groupStates = await this.get(guild, 'groupStates', {})
            groupStates[group.name] = enabled
            this.set(guild, 'groupStates', groupStates)
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
