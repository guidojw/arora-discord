'use strict'
const fs = require('fs')
const path = require('path')

module.exports = class Guild {
    constructor(bot, id) {
        this.bot = bot
        this.id = id
        this.guild = this.bot.client.guilds.cache.get(id)
        this.dataPath = path.join(__dirname, '../../data', `${id}.json`)
        this.data = undefined
    }

    loadData = async () => {
        try {
            await fs.promises.access(this.dataPath)
        } catch (err) {
            await fs.promises.writeFile(this.dataPath, JSON.stringify({

            }))
        }
        this.data = JSON.parse(await fs.promises.readFile(this.dataPath))
    }

    async setData (key, value) {
        if (!this.data) throw new Error('Guild data is not loaded yet.')
        this.data[key] = value
        await fs.promises.writeFile(this.dataPath, JSON.stringify(this.data))
    }

    getData (key) {
        if (!this.data) throw new Error('Guild data is not loaded yet.')
        return this.data[key]
    }
}
