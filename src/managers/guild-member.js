'use strict'

const { Collection, GuildMemberManager } = require('discord.js')
const { userService } = require('../services')

class AroraGuildMemberManager extends GuildMemberManager {
  async fetch (options) {
    if (typeof options === 'number') {
      if (this.guild.robloxUsernamesInNicknames) {
        const username = (await userService.getUser(options)).name
        const usernameRegex = new RegExp(`(?:^|\\s+)(${username})(?:$|\\s+)`)
        return (await this.fetch()).filter(member => usernameRegex.test(member.displayName))
      } else {
        return this.cache.filter(member => member.robloxId === options)
      }
    } else if (typeof options === 'string') {
      if (!/^[0-9]+$/.test(options)) {
        if (this.guild.robloxUsernamesInNicknames) {
          const usernameRegex = new RegExp(`(?:^|\\s+)(${options})(?:$|\\s+)`)
          return (await this.fetch()).filter(member => usernameRegex.test(member.displayName))
        } else {
          return new Collection()
        }
      }
    }
    return super.fetch(options)
  }
}

module.exports = AroraGuildMemberManager
