'use strict'
module.exports = class SettingProvider {
    init = async client => {
        this.bot = client.bot

        client.on('commandPrefixChange', (guild, prefix) => {
            this.set(guild, 'prefix', prefix)
        })
    }

    async setSettings (guild, settings) {
        await this.bot.guilds[guild.id].setData('settings', settings)
    }

    async getSettings (guild) {
        return this.bot.guilds[guild.id].getData('settings')
    }

    async set (guild, key, val) {
        const settings = await this.getSettings(guild)
        settings[key] = val
        return this.setSettings(guild, settings)
    }

    async get (guild, key, defVal) {
        const settings = await this.getSettings(guild)
        return settings[key] || defVal
    }

    async clear (guild) {
        return this.setSettings(guild, undefined)
    }
}
