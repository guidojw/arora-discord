'use strict'

const { BaseManager: DiscordBaseManager } = require('discord.js')

class BaseManager extends DiscordBaseManager {
  resolve (idOrInstance) {
    if (idOrInstance instanceof this.holds) {
      return idOrInstance
    }
    if (typeof idOrInstance === 'number') {
      return this.cache.get(idOrInstance) || null
    }
    return null
  }

  resolveID (idOrInstance) {
    if (idOrInstance instanceof this.holds) {
      return idOrInstance.id
    }
    if (typeof idOrInstance === 'number') {
      return idOrInstance
    }
    return null
  }
}

module.exports = BaseManager
