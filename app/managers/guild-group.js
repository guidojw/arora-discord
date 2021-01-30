'use strict'
const { BaseManager } = require('discord.js')
const { Group } = require('../structures')

class GuildGroupManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Group)

    this.guild = guild
  }

  _add (data) {
    const existing = this.cache.get(data.id)
    if (existing) {
      return existing
    }

    const group = Group.create(this.client, data, this.guild)
    this.cache.set(group.id, group)
    return group
  }
}

module.exports = GuildGroupManager
