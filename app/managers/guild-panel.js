'use strict'
const { BaseManager } = require('discord.js')
const { Panel: PanelModel } = require('../models')
const { Panel } = require('../structures')

class GuildPanelManager extends BaseManager {
  constructor (guild, iterable) {
    super(guild.client, iterable, Panel)

    this.guild = guild
  }

  add (data) {
    // const existing = this.cache.get(data.id)
    // if (existing) {
    //   return existing
    // }
    //
    // const role = this.guild.roles.cache.get(data.id)
    // this._roles.set(role.id, role)
    // return role
  }

  async create () {

  }

  async delete () {

  }

  async post () {

  }
}

module.exports = GuildPanelManager
